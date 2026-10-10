public sealed record SeedDocument(
    SeedAuthor CurrentUser,
    IReadOnlyList<SeedFeedback> Feedback,
    IReadOnlyList<SeedComment> Comments,
    IReadOnlyList<SeedReply> Replies
);

public sealed record SeedAuthor(string Name, string Username, string Avatar);

public sealed record SeedFeedback(
    int Id,
    string Title,
    Category Category,
    Status Status,
    int Upvotes,
    string Description
);

public sealed record SeedComment(int Id, int FeedbackId, string Content, SeedAuthor Author);

public sealed record SeedReply(
    int Id,
    int CommentId,
    string ReplyingTo,
    string Content,
    SeedAuthor Author
);
