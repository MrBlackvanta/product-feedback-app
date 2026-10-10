using System.Net;
using System.Net.Http.Json;

namespace FeedbackApi.Tests;

public class ConversationTests : BoardTests
{
    [Fact]
    public async Task PostsACommentAsTheSignedInReader()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback/2/comments",
            new { content = "This would save me a lot of scrolling." }
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/2")).BodyAsync();
        var posted = detail.List("comments").At(0);

        Assert.Equal("This would save me a lot of scrolling.", posted.Text("content"));
        Assert.Equal("velvetround", posted["author"]!.Text("username"));
        Assert.Equal(1, detail.Number("commentCount"));
    }

    [Fact]
    public async Task TrimsACommentBeforePostingIt()
    {
        await Client.PostAsJsonAsync("/api/feedback/2/comments", new { content = "  Bumping.  " });

        var detail = await (await Client.GetAsync("/api/feedback/2")).BodyAsync();

        Assert.Equal("Bumping.", detail.List("comments").At(0).Text("content"));
    }

    [Fact]
    public async Task RefusesACommentWithNothingInIt()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback/2/comments",
            new { content = "   " }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["content"]);
    }

    [Fact]
    public async Task RefusesACommentPastTheCounterTheFormShows()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback/2/comments",
            new { content = new string('a', Limits.Content + 1) }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["content"]);
    }

    [Fact]
    public async Task AnswersNotFoundWhenCommentingOnARequestThatIsGone()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback/404/comments",
            new { content = "Bumping." }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostsAReplyUnderTheCommentItAnswers()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/comments/2/replies",
            new { content = "Same here.", replyingTo = "velvetround" }
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();
        var posted = detail.List("comments").At(1).List("replies").At(0);

        Assert.Equal("Same here.", posted.Text("content"));
        Assert.Equal("velvetround", posted.Text("replyingTo"));
        Assert.Equal("velvetround", posted["author"]!.Text("username"));
        Assert.Equal(4, detail.Number("commentCount"));
    }

    [Fact]
    public async Task RefusesAReplyAddressedToSomebodyWhoIsNotHere()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/comments/2/replies",
            new { content = "Same here.", replyingTo = "nobody" }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["replyingTo"]);
    }

    [Fact]
    public async Task RefusesAReplyWithNothingInIt()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/comments/2/replies",
            new { content = "", replyingTo = "velvetround" }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["content"]);
    }

    [Fact]
    public async Task AnswersNotFoundWhenReplyingToACommentThatIsGone()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/comments/404/replies",
            new { content = "Same here.", replyingTo = "velvetround" }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task EditsACommentTheReaderWrote()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/comments/2",
            new { content = "  Still want this.  " }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal("Still want this.", detail.List("comments").At(1).Text("content"));
    }

    [Fact]
    public async Task RefusesToEditACommentSomebodyElseWrote()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/comments/1",
            new { content = "Not mine to change." }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal("Awesome idea.", detail.List("comments").At(0).Text("content"));
    }

    [Fact]
    public async Task RefusesAnEditThatEmptiesTheComment()
    {
        var response = await Client.PatchAsJsonAsync("/api/comments/2", new { content = "   " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["content"]);
    }

    [Fact]
    public async Task AnswersNotFoundWhenEditingACommentThatIsGone()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/comments/404",
            new { content = "Bumping." }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeletesACommentTheReaderWroteAlongWithItsReplies()
    {
        await Client.PostAsJsonAsync(
            "/api/comments/2/replies",
            new { content = "Agreed.", replyingTo = "velvetround" }
        );

        var response = await Client.DeleteAsync("/api/comments/2");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal(2, detail.Number("commentCount"));
        Assert.Single(detail.List("comments"));
    }

    [Fact]
    public async Task RefusesToDeleteACommentSomebodyElseWrote()
    {
        var response = await Client.DeleteAsync("/api/comments/1");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal(
            3,
            (await (await Client.GetAsync("/api/feedback/1")).BodyAsync()).Number("commentCount")
        );
    }

    [Fact]
    public async Task EditsAReplyTheReaderWrote()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/replies/1",
            new { content = "Colours would help." }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal(
            "Colours would help.",
            detail.List("comments").At(0).List("replies").At(0).Text("content")
        );
    }

    [Fact]
    public async Task DeletesAReplyTheReaderWrote()
    {
        var response = await Client.DeleteAsync("/api/replies/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal(2, detail.Number("commentCount"));
        Assert.Empty(detail.List("comments").At(0).List("replies"));
    }

    [Fact]
    public async Task RefusesToTouchAReplySomebodyElseWrote()
    {
        await Board.ReadAsync(async database =>
        {
            database.Replies.Add(
                new Reply
                {
                    Id = 2,
                    CommentId = 2,
                    ReplyingTo = "velvetround",
                    Content = "Seconded.",
                    AuthorUsername = "upbeat1811",
                }
            );

            await database.SaveChangesAsync();
        });

        Assert.Equal(
            HttpStatusCode.Forbidden,
            (
                await Client.PatchAsJsonAsync("/api/replies/2", new { content = "Mine now." })
            ).StatusCode
        );
        Assert.Equal(
            HttpStatusCode.Forbidden,
            (await Client.DeleteAsync("/api/replies/2")).StatusCode
        );
    }
}
