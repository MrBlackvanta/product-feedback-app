using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;

namespace FeedbackApi.Tests;

public class FeedbackWriteTests : BoardTests
{
    [Fact]
    public async Task OpensANewRequestAsASuggestionNobodyHasVotedFor()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new
            {
                title = "Add a dark theme option",
                category = "ui",
                description = "Easier on the eyes at night.",
            }
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var created = (await response.BodyAsync()).Number("id");
        var stored = await (await Client.GetAsync($"/api/feedback/{created}")).BodyAsync();

        Assert.Equal("suggestion", stored.Text("status"));
        Assert.Equal("ui", stored.Text("category"));
        Assert.Equal(0, stored.Number("upvotes"));
        Assert.Equal(0, stored.Number("commentCount"));
    }

    [Fact]
    public async Task DoesNotReuseAnIdTheBoardAlreadyHandedOut()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new
            {
                title = "Add a dark theme option",
                category = "ui",
                description = "Easier on the eyes at night.",
            }
        );

        Assert.True((await response.BodyAsync()).Number("id") > 3);
    }

    [Fact]
    public async Task TrimsWhatWasTypedBeforeStoringIt()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new
            {
                title = "  Add a dark theme option  ",
                category = "ui",
                description = "  Easier on the eyes at night.  ",
            }
        );

        var created = (await response.BodyAsync()).Number("id");
        var stored = await (await Client.GetAsync($"/api/feedback/{created}")).BodyAsync();

        Assert.Equal("Add a dark theme option", stored.Text("title"));
        Assert.Equal("Easier on the eyes at night.", stored.Text("description"));
    }

    [Fact]
    public async Task RefusesARequestWithNothingWrittenInIt()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new
            {
                title = "   ",
                category = "ui",
                description = "",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var errors = (await response.BodyAsync())["errors"]!;

        Assert.NotNull(errors["title"]);
        Assert.NotNull(errors["description"]);
    }

    [Fact]
    public async Task RefusesATitleLongerThanACardCanDraw()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new
            {
                title = new string('a', Limits.Title + 1),
                category = "ui",
                description = "Easier on the eyes at night.",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["title"]);
    }

    [Fact]
    public async Task RefusesARequestThatNamesNoCategory()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/feedback",
            new { title = "Add a dark theme option", description = "Easier on the eyes." }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["category"]);
    }

    [Fact]
    public async Task SavesEveryFieldTheEditFormCanChange()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/feedback/1",
            new
            {
                title = "Add tags",
                category = "enhancement",
                status = "in-progress",
                description = "Searchable themes.",
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var stored = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal("Add tags", stored.Text("title"));
        Assert.Equal("enhancement", stored.Text("category"));
        Assert.Equal("in-progress", stored.Text("status"));
        Assert.Equal("Searchable themes.", stored.Text("description"));
    }

    [Fact]
    public async Task LeavesTheConversationAloneWhenTheRequestIsEdited()
    {
        await Client.PatchAsJsonAsync(
            "/api/feedback/1",
            new
            {
                title = "Add tags",
                category = "enhancement",
                status = "live",
                description = "Searchable themes.",
            }
        );

        var stored = await (await Client.GetAsync("/api/feedback/1")).BodyAsync();

        Assert.Equal(3, stored.Number("commentCount"));
        Assert.Equal(2, stored.List("comments").Count);
    }

    [Fact]
    public async Task RefusesAnEditThatClearsTheTitle()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/feedback/1",
            new
            {
                title = "",
                category = "ui",
                status = "live",
                description = "Searchable themes.",
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["title"]);
    }

    [Fact]
    public async Task AnswersNotFoundWhenEditingARequestThatIsGone()
    {
        var response = await Client.PatchAsJsonAsync(
            "/api/feedback/404",
            new
            {
                title = "Add tags",
                category = "ui",
                status = "live",
                description = "Searchable themes.",
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task TakesTheConversationWithTheRequestItDeletes()
    {
        var response = await Client.DeleteAsync("/api/feedback/1");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await Client.GetAsync("/api/feedback/1")).StatusCode
        );

        await Board.ReadAsync(async database =>
        {
            Assert.Empty(await database.Comments.ToListAsync());
            Assert.Empty(await database.Replies.ToListAsync());
        });
    }

    [Fact]
    public async Task LeavesTheAuthorsBehindWhenARequestIsDeleted()
    {
        await Client.DeleteAsync("/api/feedback/1");

        await Board.ReadAsync(async database => Assert.Equal(2, await database.Users.CountAsync()));
    }

    [Fact]
    public async Task AnswersNotFoundWhenDeletingARequestThatIsGone()
    {
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await Client.DeleteAsync("/api/feedback/404")).StatusCode
        );
    }

    [Fact]
    public async Task CountsAVoteUpAndBackDown()
    {
        await Client.PostAsJsonAsync("/api/feedback/1/upvote", new { delta = 1 });

        Assert.Equal(
            13,
            (await (await Client.GetAsync("/api/feedback/1")).BodyAsync()).Number("upvotes")
        );

        await Client.PostAsJsonAsync("/api/feedback/1/upvote", new { delta = -1 });

        Assert.Equal(
            12,
            (await (await Client.GetAsync("/api/feedback/1")).BodyAsync()).Number("upvotes")
        );
    }

    [Fact]
    public async Task NeverCountsARequestBelowZero()
    {
        var response = await Client.PostAsJsonAsync("/api/feedback/3/upvote", new { delta = -1 });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            0,
            (await (await Client.GetAsync("/api/feedback/3")).BodyAsync()).Number("upvotes")
        );
    }

    [Fact]
    public async Task RefusesAVoteThatIsNotASingleStep()
    {
        var response = await Client.PostAsJsonAsync("/api/feedback/1/upvote", new { delta = 25 });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.NotNull((await response.BodyAsync())["errors"]!["delta"]);
        Assert.Equal(
            12,
            (await (await Client.GetAsync("/api/feedback/1")).BodyAsync()).Number("upvotes")
        );
    }

    [Fact]
    public async Task AnswersNotFoundWhenVotingOnARequestThatIsGone()
    {
        var response = await Client.PostAsJsonAsync("/api/feedback/404/upvote", new { delta = 1 });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
