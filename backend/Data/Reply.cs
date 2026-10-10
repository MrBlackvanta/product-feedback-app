public class Reply
{
    public int Id { get; set; }
    public int CommentId { get; set; }
    public required string ReplyingTo { get; set; }
    public required string Content { get; set; }
    public required string AuthorUsername { get; set; }
    public User Author { get; set; } = null!;
}
