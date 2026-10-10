using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

public static class FeedbackDatabase
{
    public static IServiceCollection AddFeedbackDatabase(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var schema = DatabaseSchema.Resolve(configuration);

        services.AddSingleton(schema);
        services.AddDbContext<FeedbackDbContext>(options =>
            Configure(options, DatabaseConnection.Resolve(configuration), schema)
        );

        return services;
    }

    public static void Configure(
        DbContextOptionsBuilder options,
        string connection,
        DatabaseSchema schema
    ) =>
        options
            .UseNpgsql(
                connection,
                npgsql =>
                    npgsql.MigrationsHistoryTable(HistoryRepository.DefaultTableName, schema.Name)
            )
            .UseSnakeCaseNamingConvention();
}
