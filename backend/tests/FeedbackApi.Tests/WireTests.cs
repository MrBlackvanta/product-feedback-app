using System.Text.Json;

namespace FeedbackApi.Tests;

public class WireTests
{
    [Theory]
    [InlineData(Category.Ui, "ui")]
    [InlineData(Category.Ux, "ux")]
    [InlineData(Category.Enhancement, "enhancement")]
    [InlineData(Category.Bug, "bug")]
    [InlineData(Category.Feature, "feature")]
    public void SpellsEveryCategoryTheWayTheBoardSendsIt(Category value, string expected)
    {
        Assert.Equal(expected, Wire<Category>.Of(value));
    }

    [Theory]
    [InlineData(Status.Suggestion, "suggestion")]
    [InlineData(Status.Planned, "planned")]
    [InlineData(Status.InProgress, "in-progress")]
    [InlineData(Status.Live, "live")]
    public void SpellsEveryStatusTheWayTheBoardSendsIt(Status value, string expected)
    {
        Assert.Equal(expected, Wire<Status>.Of(value));
    }

    [Fact]
    public void ReadsBackEveryNameItWrites()
    {
        Assert.All(
            Enum.GetValues<Status>(),
            value => Assert.Equal(value, Wire<Status>.Parse(Wire<Status>.Of(value)))
        );
        Assert.All(
            Enum.GetValues<Category>(),
            value => Assert.Equal(value, Wire<Category>.Parse(Wire<Category>.Of(value)))
        );
    }

    [Fact]
    public void RefusesAStoredValueItDoesNotRecognise()
    {
        var error = Assert.Throws<InvalidOperationException>(() => Wire<Status>.Parse("shipped"));

        Assert.Contains("shipped", error.Message);
        Assert.Contains(nameof(Status), error.Message);
    }

    [Fact]
    public void UsesTheSameNamesInJsonAsInTheDatabase()
    {
        var written = JsonSerializer.Serialize(Status.InProgress, Wire.Json);

        Assert.Equal("\"in-progress\"", written);
        Assert.Equal(Wire<Status>.Of(Status.InProgress), written.Trim('"'));
        Assert.Equal(
            Status.InProgress,
            JsonSerializer.Deserialize<Status>("\"in-progress\"", Wire.Json)
        );
    }

    [Fact]
    public void FencesAColumnToTheNamesTheEnumAllows()
    {
        Assert.Equal(
            "\"status\" in ('suggestion', 'planned', 'in-progress', 'live')",
            Wire.OneOf<Status>("status")
        );
    }
}
