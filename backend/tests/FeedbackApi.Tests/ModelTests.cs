using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace FeedbackApi.Tests;

public class ModelTests
{
    const string Schema = "feedback";

    static DbContextOptions<FeedbackDbContext> Options()
    {
        var options = new DbContextOptionsBuilder<FeedbackDbContext>();

        FeedbackDatabase.Configure(
            options,
            "Host=db.example.test;Database=postgres",
            new DatabaseSchema(Schema)
        );

        return options.Options;
    }

    static FeedbackDbContext Deployed() => new(Options(), new DatabaseSchema(Schema));

    [Fact]
    public void CarriesAMigrationForEveryChangeToTheModel()
    {
        using var database = Deployed();

        Assert.False(database.Database.HasPendingModelChanges());
    }

    [Fact]
    public void KeepsEveryTableInTheSchemaThisServiceOwns()
    {
        using var database = Deployed();

        Assert.All(
            database.Model.GetEntityTypes(),
            entity => Assert.Equal(Schema, entity.GetSchema())
        );
    }

    [Fact]
    public void KeepsTheMigrationLedgerBesideTheTablesItRecords()
    {
        var relational = Options().Extensions.OfType<RelationalOptionsExtension>().Single();

        Assert.Equal(Schema, relational.MigrationsHistoryTableSchema);
        Assert.Equal(HistoryRepository.DefaultTableName, relational.MigrationsHistoryTableName);
    }

    [Fact]
    public void NamesEveryColumnTheWayAHandWrittenQueryWouldSpellIt()
    {
        using var database = Deployed();

        var columns = database
            .Model.GetEntityTypes()
            .SelectMany(entity => entity.GetProperties())
            .Select(property => property.GetColumnName())
            .ToList();

        Assert.All(columns, column => Assert.Equal(column.ToLowerInvariant(), column));
        Assert.Contains("author_username", columns);
        Assert.Contains("replying_to", columns);
        Assert.Contains("is_current", columns);
        Assert.Contains("feedback_id", columns);
    }
}
