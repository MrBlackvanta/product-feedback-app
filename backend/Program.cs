using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});
builder.Services.AddOpenApi();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(Wire.Enums())
);

builder.Services.AddFeedbackDatabase(builder.Configuration);

builder.Services.AddProblemDetails();
builder
    .Services.AddHealthChecks()
    .AddDbContextCheck<FeedbackDbContext>(customTestQuery: MigrationLedgerAnswers);

builder.Services.AddRateLimiter(RateLimits.Configure);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod()
    );
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
    app.UseHttpsRedirection();
}

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseCors();
app.Use(NeverCache);
app.UseRateLimiter();

app.MapHealthChecks("/health").DisableRateLimiting();
app.MapFeedbackApi();

await DatabaseMigrations.EnsureUpToDateAsync<FeedbackDbContext>(app.Services);
await DatabaseSeed.EnsureSeededAsync(app.Services);

app.Run();

static async Task<bool> MigrationLedgerAnswers(FeedbackDbContext database, CancellationToken token)
{
    var applied = await database.Database.GetAppliedMigrationsAsync(token);

    return applied.Any();
}

static Task NeverCache(HttpContext context, RequestDelegate next)
{
    context.Response.Headers.CacheControl = "no-store";
    context.Response.Headers.Vary = "Origin";

    return next(context);
}

public partial class Program;
