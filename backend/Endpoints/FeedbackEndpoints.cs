using System.Linq.Expressions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

public static class FeedbackEndpoints
{
    static readonly Expression<Func<Feedback, FeedbackView>> Summary = item => new FeedbackView(
        item.Id,
        item.Title,
        item.Category,
        item.Status,
        item.Upvotes,
        item.Description,
        item.Comments.Count + item.Comments.Sum(comment => comment.Replies.Count)
    );

    static readonly Expression<Func<Comment, CommentView>> Conversation =
        comment => new CommentView(
            comment.Id,
            comment.Content,
            new UserView(comment.Author.Name, comment.Author.Username, comment.Author.Avatar),
            comment
                .Replies.OrderBy(reply => reply.Id)
                .Select(reply => new ReplyView(
                    reply.Id,
                    reply.ReplyingTo,
                    reply.Content,
                    new UserView(reply.Author.Name, reply.Author.Username, reply.Author.Avatar)
                ))
                .ToList()
        );

    public static IEndpointRouteBuilder MapFeedbackApi(this IEndpointRouteBuilder routes)
    {
        var api = routes.MapGroup("/api");

        api.MapGet("/me", CurrentUser);
        api.MapPost("/comments/{commentId:int}/replies", AddReply);

        var board = api.MapGroup("/feedback");

        board.MapGet("", List);
        board.MapPost("", Create);
        board.MapGet("/{id:int}", Detail);
        board.MapPatch("/{id:int}", Edit);
        board.MapDelete("/{id:int}", Remove);
        board.MapPost("/{id:int}/upvote", Vote);
        board.MapPost("/{id:int}/comments", AddComment);

        return routes;
    }

    static async Task<Ok<UserView>> CurrentUser(
        FeedbackDbContext database,
        CancellationToken token
    ) =>
        TypedResults.Ok(
            await database
                .Users.Where(user => user.IsCurrent)
                .Select(user => new UserView(user.Name, user.Username, user.Avatar))
                .FirstAsync(token)
        );

    static async Task<Ok<List<FeedbackView>>> List(
        FeedbackDbContext database,
        CancellationToken token
    ) =>
        TypedResults.Ok(
            await database.Feedback.OrderBy(item => item.Id).Select(Summary).ToListAsync(token)
        );

    static async Task<Results<Ok<FeedbackDetailView>, NotFound>> Detail(
        int id,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var request = await database
            .Feedback.Where(item => item.Id == id)
            .Select(Summary)
            .FirstOrDefaultAsync(token);

        if (request is null)
        {
            return TypedResults.NotFound();
        }

        var comments = await database
            .Comments.Where(comment => comment.FeedbackId == id)
            .OrderBy(comment => comment.Id)
            .Select(Conversation)
            .ToListAsync(token);

        return TypedResults.Ok(new FeedbackDetailView(request, comments));
    }

    static async Task<Results<Created<CreatedView>, ValidationProblem>> Create(
        NewFeedback form,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var checks = new Checks();
        var title = checks.Text("title", form.Title, Limits.Title);
        var description = checks.Text("description", form.Description, Limits.Description);
        var category = checks.Chosen("category", form.Category);

        if (checks.Failed(out var problem))
        {
            return problem;
        }

        var created = new Feedback
        {
            Title = title,
            Category = category,
            Status = Status.Suggestion,
            Description = description,
        };

        database.Feedback.Add(created);
        await database.SaveChangesAsync(token);

        return TypedResults.Created($"/api/feedback/{created.Id}", new CreatedView(created.Id));
    }

    static async Task<Results<NoContent, NotFound, ValidationProblem>> Edit(
        int id,
        EditFeedback form,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var checks = new Checks();
        var title = checks.Text("title", form.Title, Limits.Title);
        var description = checks.Text("description", form.Description, Limits.Description);
        var category = checks.Chosen("category", form.Category);
        var status = checks.Chosen("status", form.Status);

        if (checks.Failed(out var problem))
        {
            return problem;
        }

        var stored = await database.Feedback.FindAsync([id], token);

        if (stored is null)
        {
            return TypedResults.NotFound();
        }

        stored.Title = title;
        stored.Description = description;
        stored.Category = category;
        stored.Status = status;

        await database.SaveChangesAsync(token);

        return TypedResults.NoContent();
    }

    static async Task<Results<NoContent, NotFound>> Remove(
        int id,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var removed = await database
            .Feedback.Where(item => item.Id == id)
            .ExecuteDeleteAsync(token);

        if (removed == 0)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.NoContent();
    }

    static async Task<Results<NoContent, NotFound, ValidationProblem>> Vote(
        int id,
        NewVote form,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var checks = new Checks();
        var delta = form.Delta;

        if (delta is not (1 or -1))
        {
            checks.Reject("delta", "Must be 1 or -1.");
        }

        if (checks.Failed(out var problem))
        {
            return problem;
        }

        var changed = await database
            .Feedback.Where(item => item.Id == id)
            .ExecuteUpdateAsync(
                set =>
                    set.SetProperty(
                        item => item.Upvotes,
                        item => Math.Max(0, item.Upvotes + delta)
                    ),
                token
            );

        if (changed == 0)
        {
            return TypedResults.NotFound();
        }

        return TypedResults.NoContent();
    }

    static async Task<Results<Created<CreatedView>, NotFound, ValidationProblem>> AddComment(
        int id,
        NewComment form,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var checks = new Checks();
        var content = checks.Text("content", form.Content, Limits.Content);

        if (checks.Failed(out var problem))
        {
            return problem;
        }

        if (!await database.Feedback.AnyAsync(item => item.Id == id, token))
        {
            return TypedResults.NotFound();
        }

        var comment = new Comment
        {
            FeedbackId = id,
            Content = content,
            AuthorUsername = await CurrentUsername(database, token),
        };

        database.Comments.Add(comment);
        await database.SaveChangesAsync(token);

        return TypedResults.Created($"/api/feedback/{id}", new CreatedView(comment.Id));
    }

    static async Task<Results<Created<CreatedView>, NotFound, ValidationProblem>> AddReply(
        int commentId,
        NewReply form,
        FeedbackDbContext database,
        CancellationToken token
    )
    {
        var checks = new Checks();
        var content = checks.Text("content", form.Content, Limits.Content);
        var replyingTo = checks.Text("replyingTo", form.ReplyingTo, Limits.Username);

        if (
            replyingTo.Length > 0
            && !await database.Users.AnyAsync(user => user.Username == replyingTo, token)
        )
        {
            checks.Reject("replyingTo", "Unknown user.");
        }

        if (checks.Failed(out var problem))
        {
            return problem;
        }

        var parent = await database
            .Comments.Where(comment => comment.Id == commentId)
            .Select(comment => new { comment.FeedbackId })
            .FirstOrDefaultAsync(token);

        if (parent is null)
        {
            return TypedResults.NotFound();
        }

        var reply = new Reply
        {
            CommentId = commentId,
            ReplyingTo = replyingTo,
            Content = content,
            AuthorUsername = await CurrentUsername(database, token),
        };

        database.Replies.Add(reply);
        await database.SaveChangesAsync(token);

        return TypedResults.Created(
            $"/api/feedback/{parent.FeedbackId}",
            new CreatedView(reply.Id)
        );
    }

    static Task<string> CurrentUsername(FeedbackDbContext database, CancellationToken token) =>
        database
            .Users.Where(user => user.IsCurrent)
            .Select(user => user.Username)
            .FirstAsync(token);
}
