using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FeedbackApi.Tests;

public sealed class Board : IAsyncLifetime
{
    readonly SqliteConnection connection = new("Filename=:memory:;Foreign Keys=True");

    WebApplication application = null!;

    public HttpClient Client { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        await connection.OpenAsync();

        var builder = WebApplication.CreateBuilder();

        builder.Logging.ClearProviders();
        builder.WebHost.UseTestServer();
        builder.Services.AddSingleton(new DatabaseSchema("feedback"));
        builder.Services.AddDbContext<FeedbackDbContext>(options =>
            options.UseSqlite(connection).UseSnakeCaseNamingConvention()
        );
        builder.Services.ConfigureHttpJsonOptions(options =>
            options.SerializerOptions.Converters.Add(Wire.Enums())
        );

        application = builder.Build();
        application.MapFeedbackApi();

        await ReadAsync(async database =>
        {
            await database.Database.EnsureCreatedAsync();
            Fill(database);
            await database.SaveChangesAsync();
        });

        await application.StartAsync();

        Client = application.GetTestClient();
    }

    public async Task ReadAsync(Func<FeedbackDbContext, Task> work)
    {
        await using var scope = application.Services.CreateAsyncScope();

        await work(scope.ServiceProvider.GetRequiredService<FeedbackDbContext>());
    }

    public async Task DisposeAsync()
    {
        Client?.Dispose();
        await application.DisposeAsync();
        await connection.DisposeAsync();
    }

    static void Fill(FeedbackDbContext database)
    {
        database.Users.AddRange(
            new User
            {
                Username = "velvetround",
                Name = "Zane Kelley",
                Avatar = "zane",
                IsCurrent = true,
            },
            new User
            {
                Username = "upbeat1811",
                Name = "Sutton Chang",
                Avatar = "sutton",
            }
        );

        var tags = new Feedback
        {
            Id = 1,
            Title = "Add tags for feedback",
            Category = Category.Feature,
            Status = Status.Suggestion,
            Upvotes = 12,
            Description = "Easier to search for posts.",
        };

        var opener = new Comment
        {
            Id = 1,
            Content = "Awesome idea.",
            AuthorUsername = "upbeat1811",
        };

        opener.Replies.Add(
            new Reply
            {
                Id = 1,
                ReplyingTo = "upbeat1811",
                Content = "Colour coded would help.",
                AuthorUsername = "velvetround",
            }
        );

        tags.Comments.Add(opener);
        tags.Comments.Add(
            new Comment
            {
                Id = 2,
                Content = "Bumping this.",
                AuthorUsername = "velvetround",
            }
        );

        database.Feedback.AddRange(
            tags,
            new Feedback
            {
                Id = 2,
                Title = "Bookmark feedback",
                Category = Category.Ui,
                Status = Status.InProgress,
                Upvotes = 5,
                Description = "Save a request to read later.",
            },
            new Feedback
            {
                Id = 3,
                Title = "Preview images not loading",
                Category = Category.Bug,
                Status = Status.Suggestion,
                Upvotes = 0,
                Description = "Board preview images are missing.",
            }
        );
    }
}
