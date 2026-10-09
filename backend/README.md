# Feedback API

Self-hosted .NET 9 backend for the product feedback board. At this point it is the service
scaffold only — configuration, connection handling, rate limiting, CORS, health checks, the
migration gate and the container. The model and its endpoints land with the sections that use
them.

## Tech stack

- **.NET 9 / ASP.NET Core** — minimal APIs, top-level statements
- **Entity Framework Core 9** with **PostgreSQL** (Npgsql) — durable managed database,
  snake_case schema so the tables are pleasant to query by hand
- **Microsoft.AspNetCore.OpenApi** + **Scalar** — interactive API documentation
- **Rate limiting** — fixed window, 60 requests per minute per forwarded IP
- **Health checks** — `/health`, exempt from the rate limit
- **CORS** — configurable allow-list, sourced from environment variables in production
- **ProblemDetails** (RFC 7807) — uniform error response shape across all failure paths
- **Forwarded headers** — proxy-aware request handling for cloud deployments
- **Docker** — multi-stage build, runs as non-root `app` user

## Quick start

The service needs a PostgreSQL connection string. Point it at a throwaway local database:

```bash
docker run -d --name feedback-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=feedback postgres:17-alpine
```

That matches the default in `appsettings.Development.json`. To use a hosted database instead,
set a user secret, which overrides that default and stays out of the repository:

```bash
dotnet user-secrets set "ConnectionStrings:Default" "postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres"
```

Then:

```bash
cd backend
dotnet run
```

The service listens on `http://localhost:5181`.

Interactive docs: open `http://localhost:5181/scalar/v1` in a browser.

Changing the model means a new migration, which needs the EF Core tools
(`dotnet tool install --global dotnet-ef`):

```bash
dotnet ef migrations add <Name> -o Data/Migrations
```

## Tests

xUnit, in `tests/FeedbackApi.Tests`, run with `dotnet test`. They currently cover the
connection-string parser, the schema resolver and the migration gate — the three pieces that
decide whether the service may boot at all.

The test project sits under `backend/` but is excluded from the API's compile items and from
the Docker context, so `dotnet publish` and the image never see it.

## Storage

Render's free plan has no persistent disk and recycles the container on every deploy and every
idle spin-down, so a SQLite file would be destroyed roughly every fifteen idle minutes. Storage
is a managed PostgreSQL database reached through `ConnectionStrings__Default`, which is set in
the Render dashboard and never committed.

Connect through a pooler rather than the direct host. The direct connection is IPv6-only on
most managed providers and Render's egress is not, so a direct string fails to resolve from the
deployed container while working fine from a laptop.

Managed providers hand out a `postgresql://` URI and Npgsql only parses key-value form, so
`DatabaseConnection` expands one into the other, passes a key-value string through, and rejects
anything that is neither. That last case matters more than it looks: a value that silently falls
through reaches Npgsql as a malformed connection string, and the parser error it raises names no
cause and no variable, which is a long way to travel for a stray pair of quotes around a pasted
URI. Doing that in code rather than by hand is not a convenience either: the URI percent-encodes
the password, so a password containing `@` or `#` is silently wrong when retyped, and one
containing `;` terminates the key-value string early unless it is quoted. A URI also implies a
managed host, which is where `SSL Mode=Require`, the pool ceiling and a sixty-second idle
lifetime come from — a free pooler allows far fewer connections than Npgsql's default of 100.
`Require` encrypts without verifying the certificate; pinning the provider's CA and moving to
`VerifyFull` is the upgrade if this ever holds anything worth stealing.

That ceiling is arithmetic rather than taste. A free instance allows 60 database connections,
and the platform's own services plus the superuser reservation take roughly half. Session mode
— what the dashboard's port-5432 URI gives, and what Render needs because the direct host is
IPv6-only — pins one database connection per pooled client for the life of the session, so the
limit that binds is that 60 rather than the pooler's 200 client slots. Budget two instances per
service across a deploy and the sum is apps × 2 × `MaxPoolSize` against roughly 32 usable.
Four services share this database, so the ceiling here is **4**, not the 5 that fitted three.
The idle lifetime matters for the same reason and would not on a dedicated database: a service
sitting idle on its connections is holding slots a neighbour needs.

## One database, a schema per app

The free plan grants two projects per organisation and both were spent, which left a third
service wanting a database with nowhere to put one. So the backends share a single project and
take a schema each — `feedback` here, with `invoice`, `todo` and `audiophile` next door —
rather than a project each.

Sharing needs both halves of the move, and either half alone is worse than neither.
`HasDefaultSchema` moves the tables; `MigrationsHistoryTable` moves the ledger recording which
migrations have run. Move only the tables and every service keeps reading and writing
`public.__EFMigrationsHistory`, where each reads the others' migration ids as its own history
and then generates a migration dropping their tables. The two calls sit beside each other in
`Program.cs`, fed by the same local, so they cannot drift apart.

Both were set before the first migration was generated, so `InitialCreate` emits `EnsureSchema`
and `CreateTable(schema:)` and the ledger is born in `feedback`. A service retrofitted later
cannot move its own ledger — EF reads a ledger that is not there, finds zero applied migrations
and replays from the first against populated tables — and the fix is a hand-moved ledger against
a suspended service.

The schema name is configuration rather than a constant, so one connection string serves every
service and only `Database__Schema` differs between them. `DatabaseSchema` refuses anything that
is not a bare identifier, because the value reaches generated DDL rather than a parameter. It is
per service and close to permanent: repointing an existing service at a different schema needs a
move migration rather than just a new variable.

A schema is a namespace and not a security boundary — the role in the connection string reads
every schema in the database. What it buys is that two services' migrations cannot collide, and
that these tables leave `public`, which is the only schema the Data API exposes by default.

## Why migrations, not EnsureCreated

`EnsureCreated` is fine against a disposable file and silently useless against a managed
Postgres. It creates the schema only when the database has no tables at all, and Npgsql's check
counts every schema except `pg_catalog` and `information_schema` — so a Supabase project, which
ships its own `auth` and `storage` tables before you write a line, always looks populated. The
call returns `false`, creates nothing, and the service starts perfectly. `/health` stays green,
because a connectivity probe opens a connection without touching a table. Every real query then
fails on a table that was never created.

That is the trap worth remembering: a green health check and a broken database are the same
observation unless the probe touches what the queries touch. So `/health` reads this schema's
`__EFMigrationsHistory` rather than opening a connection — the one table that exists from the
first migration onward, which makes the check real before there is a model to query.

Applying migrations is gated. `Migrations__Apply` defaults to false, and a boot that finds
pending migrations without it refuses to start rather than serving against a schema it does not
match. Render holds the previous instance when a new one fails its health check, so a refusal
costs a no-op deploy instead of an outage, and the deploy that *should* migrate is one where the
variable was set deliberately. Ungated, every commit is a production migration — which would
reach the neighbours sharing this database, whose rows someone would miss.

## Keeping it awake

Two different idle timers apply, and only one of them ever costs data.

Render spins a free instance down after roughly fifteen minutes, which costs a cold start of
about a minute rather than the database. A managed Postgres project on a free plan typically
pauses after some days of no queries; the data survives, but restoring it is manual. `/health`
is exempt from the rate limit, so a single scheduled request to it resets the instance timer.
A cron worker outside this repository sends one every five minutes through the working day, and
one database-touching request daily. Anyone self-hosting this needs their own equivalent, or a
paid plan that never sleeps.

Render's free tier also meters 750 instance-hours a month across the whole workspace, so the
warm window is shared by every service rather than owned by one. Adding this service narrows
that window for all of them.
