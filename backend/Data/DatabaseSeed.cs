using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public static class DatabaseSeed
{
    const string Resource = "seed.json";

    public static SeedDocument Read()
    {
        using var stream =
            typeof(DatabaseSeed).Assembly.GetManifestResourceStream(Resource)
            ?? throw new InvalidOperationException($"{Resource} is not embedded in this build.");

        return JsonSerializer.Deserialize<SeedDocument>(stream, Wire.Json)
            ?? throw new InvalidOperationException($"{Resource} holds no document.");
    }

    public static List<User> UsersOf(SeedDocument document) =>
        document
            .Comments.Select(comment => comment.Author)
            .Concat(document.Replies.Select(reply => reply.Author))
            .Append(document.CurrentUser)
            .DistinctBy(author => author.Username)
            .Select(author => new User
            {
                Username = author.Username,
                Name = author.Name,
                Avatar = author.Avatar,
                IsCurrent = author.Username == document.CurrentUser.Username,
            })
            .ToList();

    public static List<Feedback> RequestsOf(SeedDocument document) =>
        document
            .Feedback.Select(item => new Feedback
            {
                Id = item.Id,
                Title = item.Title,
                Category = item.Category,
                Status = item.Status,
                Upvotes = item.Upvotes,
                Description = item.Description,
            })
            .ToList();

    public static List<Comment> CommentsOf(SeedDocument document) =>
        document
            .Comments.Select(comment => new Comment
            {
                Id = comment.Id,
                FeedbackId = comment.FeedbackId,
                Content = comment.Content,
                AuthorUsername = comment.Author.Username,
            })
            .ToList();

    public static List<Reply> RepliesOf(SeedDocument document) =>
        document
            .Replies.Select(reply => new Reply
            {
                Id = reply.Id,
                CommentId = reply.CommentId,
                ReplyingTo = reply.ReplyingTo,
                Content = reply.Content,
                AuthorUsername = reply.Author.Username,
            })
            .ToList();

    public static async Task EnsureSeededAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var database = scope.ServiceProvider.GetRequiredService<FeedbackDbContext>();

        await using var transaction = await database.Database.BeginTransactionAsync();

        if (await database.Feedback.AnyAsync())
        {
            return;
        }

        var document = Read();

        database.Users.AddRange(UsersOf(document));
        database.Feedback.AddRange(RequestsOf(document));
        database.Comments.AddRange(CommentsOf(document));
        database.Replies.AddRange(RepliesOf(document));

        await database.SaveChangesAsync();
        await AdvanceIdentityAsync(database);
        await transaction.CommitAsync();
    }

    static async Task AdvanceIdentityAsync(FeedbackDbContext database)
    {
        foreach (var seeded in new[] { typeof(Feedback), typeof(Comment), typeof(Reply) })
        {
            var entity = database.Model.FindEntityType(seeded)!;
            var table = $"\"{entity.GetSchema()}\".\"{entity.GetTableName()}\"";
            var column = entity.FindPrimaryKey()!.Properties[0].GetColumnName();

            await database.Database.ExecuteSqlRawAsync(
                $"select setval(pg_get_serial_sequence('{table}', '{column}'), "
                    + $"(select max(\"{column}\") from {table}))"
            );
        }
    }
}
