public class Feedback
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public Category Category { get; set; }
    public Status Status { get; set; }
    public int Upvotes { get; set; }
    public required string Description { get; set; }
    public List<Comment> Comments { get; } = [];
}
