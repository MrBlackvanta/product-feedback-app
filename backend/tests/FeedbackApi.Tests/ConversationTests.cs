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
}
