namespace FeedbackApi.Tests;

public class SeedTests
{
    static readonly SeedDocument Document = DatabaseSeed.Read();

    static int Conversation(int feedbackId)
    {
        var comments = Document
            .Comments.Where(comment => comment.FeedbackId == feedbackId)
            .ToList();

        return comments.Count
            + Document.Replies.Count(reply =>
                comments.Any(comment => comment.Id == reply.CommentId)
            );
    }

    [Fact]
    public void TravelsInsideTheBuildRatherThanBesideIt()
    {
        Assert.NotEmpty(Document.Feedback);
    }

    [Fact]
    public void FillsTheBoardTheDesignDraws()
    {
        var suggestions = Document.Feedback.Count(item => item.Status == Status.Suggestion);

        Assert.Equal(12, Document.Feedback.Count);
        Assert.Equal(6, suggestions);
    }

    [Theory]
    [InlineData(Status.Planned, 2)]
    [InlineData(Status.InProgress, 3)]
    [InlineData(Status.Live, 1)]
    public void FillsEachRoadmapColumnToTheCountTheSidebarShows(Status status, int expected)
    {
        Assert.Equal(expected, Document.Feedback.Count(item => item.Status == status));
    }

    [Theory]
    [InlineData(1, 2)]
    [InlineData(2, 4)]
    [InlineData(3, 1)]
    [InlineData(4, 2)]
    [InlineData(5, 3)]
    [InlineData(6, 0)]
    public void CountsRepliesTowardsTheNumberPrintedOnACard(int feedbackId, int expected)
    {
        Assert.Equal(expected, Conversation(feedbackId));
    }

    [Fact]
    public void HangsEveryCommentOnARequestThatExists()
    {
        var known = Document.Feedback.Select(item => item.Id).ToHashSet();

        Assert.All(Document.Comments, comment => Assert.Contains(comment.FeedbackId, known));
    }

    [Fact]
    public void HangsEveryReplyOnACommentThatExists()
    {
        var known = Document.Comments.Select(comment => comment.Id).ToHashSet();

        Assert.All(Document.Replies, reply => Assert.Contains(reply.CommentId, known));
    }

    [Fact]
    public void AddressesEveryReplyToSomebodyOnTheBoard()
    {
        var known = DatabaseSeed.UsersOf(Document).Select(user => user.Username).ToHashSet();

        Assert.All(Document.Replies, reply => Assert.Contains(reply.ReplyingTo, known));
    }

    [Fact]
    public void GivesTheBoardExactlyOneSignedInReader()
    {
        var current = DatabaseSeed.UsersOf(Document).Where(user => user.IsCurrent).ToList();

        Assert.Single(current);
        Assert.Equal(Document.CurrentUser.Username, current[0].Username);
    }

    [Fact]
    public void KeepsOneRowPerAuthorHoweverOftenTheyPost()
    {
        var users = DatabaseSeed.UsersOf(Document);

        Assert.Equal(users.Count, users.Select(user => user.Username).Distinct().Count());
    }

    [Fact]
    public void CarriesTheIdsThePublishedLinksPointAt()
    {
        Assert.Equal(
            Document.Feedback.Select(item => item.Id),
            DatabaseSeed.RequestsOf(Document).Select(item => item.Id)
        );
    }
}
