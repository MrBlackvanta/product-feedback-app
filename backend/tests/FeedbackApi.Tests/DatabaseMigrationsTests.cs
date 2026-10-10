using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace FeedbackApi.Tests;

public class DatabaseMigrationsTests : IAsyncLifetime
{
    readonly SqliteConnection connection = new("Filename=:memory:");

    public Task InitializeAsync() => connection.OpenAsync();

    public async Task DisposeAsync() => await connection.DisposeAsync();

    ServiceProvider Hosting<TContext>(bool apply)
        where TContext : DbContext
    {
        var services = new ServiceCollection();

        services.AddSingleton<IConfiguration>(
            new ConfigurationBuilder()
                .AddInMemoryCollection(
                    new Dictionary<string, string?> { ["Migrations:Apply"] = apply.ToString() }
                )
                .Build()
        );
        services.AddSingleton(new DatabaseSchema("feedback"));
        services.AddDbContext<TContext>(options =>
            options.UseSqlite(connection).UseSnakeCaseNamingConvention()
        );

        return services.BuildServiceProvider();
    }

    [Fact]
    public async Task RefusesToServeAgainstASchemaItDoesNotMatch()
    {
        await using var hosting = Hosting<FeedbackDbContext>(apply: false);

        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            DatabaseMigrations.EnsureUpToDateAsync<FeedbackDbContext>(hosting)
        );

        Assert.Contains("InitialCreate", error.Message);
        Assert.Contains("Migrations__Apply=true", error.Message);
    }

    [Fact]
    public async Task StartsWhenThereIsNothingLeftToApply()
    {
        await using var hosting = Hosting<SettledContext>(apply: false);

        await DatabaseMigrations.EnsureUpToDateAsync<SettledContext>(hosting);
    }

    [Fact]
    public async Task MigratesOnTheOneDeployThatAsksForIt()
    {
        await using var hosting = Hosting<SettledContext>(apply: true);

        await DatabaseMigrations.EnsureUpToDateAsync<SettledContext>(hosting);

        await using var scope = hosting.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<SettledContext>();

        Assert.True(await database.GetService<IHistoryRepository>().ExistsAsync());
    }

    public class SettledContext(DbContextOptions<SettledContext> options) : DbContext(options);
}
