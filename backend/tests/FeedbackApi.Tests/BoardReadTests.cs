using System.Net;

namespace FeedbackApi.Tests;

public class BoardReadTests : BoardTests
{
    [Fact]
    public async Task HandsTheBoardBackInAStableOrder()
    {
        var board = await (await Client.GetAsync("/api/feedback")).ArrayAsync();

        Assert.Equal([1, 2, 3], board.Select(item => item!.Number("id")));
    }

    [Fact]
    public async Task CountsRepliesTowardsTheCommentCountOnACard()
    {
        var board = await (await Client.GetAsync("/api/feedback")).ArrayAsync();

        Assert.Equal(3, board.At(0).Number("commentCount"));
        Assert.Equal(0, board.At(1).Number("commentCount"));
    }

    [Fact]
    public async Task NamesCategoriesAndStatusesTheWayTheBoardReadsThem()
    {
        var board = await (await Client.GetAsync("/api/feedback")).ArrayAsync();

        Assert.Equal("in-progress", board.At(1).Text("status"));
        Assert.Equal("ui", board.At(1).Text("category"));
        Assert.Equal("suggestion", board.At(0).Text("status"));
        Assert.Equal("feature", board.At(0).Text("category"));
    }

    [Fact]
    public async Task CarriesEveryFieldACardDraws()
    {
        var card = (await (await Client.GetAsync("/api/feedback")).ArrayAsync()).At(0);

        Assert.Equal("Add tags for feedback", card.Text("title"));
        Assert.Equal("Easier to search for posts.", card.Text("description"));
        Assert.Equal(12, card.Number("upvotes"));
    }

    [Fact]
    public async Task OpensARequestWithItsConversation()
    {
        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();
        var comments = detail.List("comments");

        Assert.Equal(3, detail.Number("commentCount"));
        Assert.Equal([1, 2], comments.Select(comment => comment!.Number("id")));
        Assert.Equal("Awesome idea.", comments.At(0).Text("content"));
        Assert.Equal("Sutton Chang", comments.At(0)["author"]!.Text("name"));
        Assert.Equal("sutton", comments.At(0)["author"]!.Text("avatar"));
    }

    [Fact]
    public async Task NestsRepliesUnderTheCommentTheyAnswer()
    {
        var detail = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();
        var replies = detail.List("comments").At(0).List("replies");

        Assert.Single(replies);
        Assert.Equal("upbeat1811", replies.At(0).Text("replyingTo"));
        Assert.Equal("Colour coded would help.", replies.At(0).Text("content"));
        Assert.Equal("Zane Kelley", replies.At(0)["author"]!.Text("name"));
        Assert.Empty(detail.List("comments").At(1).List("replies"));
    }

    [Fact]
    public async Task OpensARequestThatNobodyHasAnsweredYet()
    {
        var detail = await (await Client.GetAsync("/api/feedback/2")).BodyAsync();

        Assert.Equal(0, detail.Number("commentCount"));
        Assert.Empty(detail.List("comments"));
    }

    [Fact]
    public async Task AnswersNotFoundForARequestThatIsNotThere()
    {
        var response = await Client.GetAsync("/api/feedback/404");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task NamesTheSignedInReader()
    {
        var reader = await (await Client.GetAsync("/api/me")).BodyAsync();

        Assert.Equal("Zane Kelley", reader.Text("name"));
        Assert.Equal("velvetround", reader.Text("username"));
        Assert.Equal("zane", reader.Text("avatar"));
    }
}
