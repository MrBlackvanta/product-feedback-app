public record FeedbackView(
    int Id,
    string Title,
    Category Category,
    Status Status,
    int Upvotes,
    string Description,
    int CommentCount
);

public record FeedbackDetailView : FeedbackView
{
    public FeedbackDetailView(FeedbackView request, IReadOnlyList<CommentView> comments)
        : base(request) => Comments = comments;

    public IReadOnlyList<CommentView> Comments { get; }
}

public record CommentView(
    int Id,
    string Content,
    UserView Author,
    IReadOnlyList<ReplyView> Replies
);

public record ReplyView(int Id, string ReplyingTo, string Content, UserView Author);

public record UserView(string Name, string Username, string Avatar);

public record CreatedView(int Id);

public record NewFeedback(string? Title, Category? Category, string? Description);

public record EditFeedback(string? Title, Category? Category, Status? Status, string? Description);

public record NewComment(string? Content);

public record NewReply(string? Content, string? ReplyingTo);

public record EditContent(string? Content);

public record NewVote(int Delta);
