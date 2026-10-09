# Townhall frontend

Next.js App Router, server-rendered on Cloudflare Workers through OpenNext. The API owns the
feedback requests; this half renders them and sends every write to the server before believing
it.

## Why not a static export

The other challenges here build with `output: "export"` and publish `out/` to Workers Static
Assets. This one cannot. A feedback request created at runtime gets an id that did not exist at
build time, so `/feedback/<id>` has no page to prerender and `generateStaticParams` can only
cover the seed rows. The alternatives were a query string standing in for a path, or routes
that 404 on exactly the records the brief asks the user to create.

OpenNext runs the same build as a Worker instead, so a dynamic segment resolves at request time
and every record gets a real URL. Rendered pages are cached in R2 through the incremental cache,
which is what keeps the API's cold start off the critical path.

## Configuration

`NEXT_PUBLIC_API_URL` is the origin of the feedback API, with no trailing slash. Unset, it falls
back to `http://localhost:5181`, the port `backend/` listens on, so `pnpm dev` needs no
configuration at all.

`next build` refuses to run when the variable is unset, because a production build that keeps
the development fallback fails in the quietest way there is: it deploys, it renders, it passes
every Lighthouse audit, and each visitor gets a retry screen while their browser tries to reach
a server on their own machine. Nothing in the build or the deploy looks wrong. Point the
variable at the local API if you want a production build without a hosted one.

## Tests

Vitest and Testing Library, run with `pnpm test`. Tests sit beside the source they exercise, as
`*.test.ts` and `*.test.tsx` under `src/`. `globals.css` excludes both patterns from Tailwind's
scan, so a class name quoted in an assertion cannot compile itself into the stylesheet.

`tests/` holds the harness rather than any tests: the setup file, and a controllable
`matchMedia` stub, which jsdom does not implement and anything reading `prefers-reduced-motion`
needs the moment it renders. The stub's `addEventListener` and `removeEventListener` are real,
so a test can prove an unsubscribe actually detaches.

jsdom has no layout engine and loads no CSS, so every rect is zero and `sr-only` does nothing.
Geometry, contrast, paint order and hit testing are measured in a real browser instead; these
tests hold behaviour and accessibility contracts.

## Running your own

Three values here are mine and are wrong for anyone else:

- `NEXT_PUBLIC_API_URL` — your API, not `vanta-feedback-api.onrender.com`. Nothing prevents a
  build from pointing at mine, but the feedback then lives in my database, on a free plan, with
  no promises attached.
- `SITE_URL` in `src/data/site.ts` — canonical link, sitemap, robots and Open Graph tags.
- `name` and the R2 bucket in `wrangler.jsonc` — the `*.workers.dev` subdomain is unique per
  account, and the bucket has to exist before the first deploy.

The API half needs its own database and its own allow-list: see `backend/README.md` for the
connection string and `render.yaml` for `Cors__AllowedOrigins__0`, which has to name whatever
origin you deploy this to. CORS constrains browsers only, so that allow-list protects your
users, not your API.

## Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm build:worker
pnpm preview:worker
```

`build:worker` produces `.open-next/`, which is what `wrangler.jsonc` publishes. Deploys happen
on push — Cloudflare Workers Builds runs `build:worker` from the repository.
