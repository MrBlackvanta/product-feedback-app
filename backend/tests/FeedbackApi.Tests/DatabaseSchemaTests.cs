using Microsoft.Extensions.Configuration;

namespace FeedbackApi.Tests;

public class DatabaseSchemaTests
{
    static IConfiguration Configured(string? value) =>
        new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Database:Schema"] = value })
            .Build();

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("\"\"")]
    public void RefusesToStartWithoutASchema(string? value)
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            DatabaseSchema.Resolve(Configured(value))
        );

        Assert.Contains("is not set", error.Message);
    }

    [Fact]
    public void ExplainsWhyTheSchemaIsTheOnlyThingThatDiffers()
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            DatabaseSchema.Resolve(Configured(null))
        );

        Assert.Contains("connection string serves every app", error.Message);
    }

    [Theory]
    [InlineData("public.feedback")]
    [InlineData("feedback;drop schema todo cascade")]
    [InlineData("two words")]
    [InlineData("feed\"back")]
    public void RefusesAValueThatWouldNeedQuoting(string value)
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            DatabaseSchema.Resolve(Configured(value))
        );

        Assert.Contains("letters, digits and underscores", error.Message);
    }

    [Theory]
    [InlineData("feedback")]
    [InlineData("todo")]
    [InlineData("todo_v2")]
    [InlineData("App1")]
    public void AcceptsABareIdentifier(string value)
    {
        Assert.Equal(value, DatabaseSchema.Resolve(Configured(value)).Name);
    }

    [Fact]
    public void UnwrapsAValueThatArrivedWrappedInQuotes()
    {
        Assert.Equal("feedback", DatabaseSchema.Resolve(Configured("\"feedback\"")).Name);
    }

    [Fact]
    public void TrimsSurroundingWhitespace()
    {
        Assert.Equal("feedback", DatabaseSchema.Resolve(Configured("  feedback  ")).Name);
    }
}
