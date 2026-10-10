public class Comment : IAuthored
{
    public int Id { get; set; }
    public int FeedbackId { get; set; }
    public required string Content { get; set; }
    public required string AuthorUsername { get; set; }
    public User Author { get; set; } = null!;
    public List<Reply> Replies { get; } = [];
}
