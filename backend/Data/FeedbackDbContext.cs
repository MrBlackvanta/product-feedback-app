using Microsoft.EntityFrameworkCore;

public class FeedbackDbContext(DbContextOptions<FeedbackDbContext> options, DatabaseSchema schema)
    : DbContext(options)
{
    public DbSet<Feedback> Feedback => Set<Feedback>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Reply> Replies => Set<Reply>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema(schema.Name);

        builder.Entity<User>(user =>
        {
            user.HasKey(one => one.Username);
            user.Property(one => one.Username).HasMaxLength(Limits.Username);
            user.Property(one => one.Name).HasMaxLength(Limits.DisplayName);
            user.Property(one => one.Avatar).HasMaxLength(Limits.Avatar);
            user.HasIndex(one => one.IsCurrent).IsUnique().HasFilter("\"is_current\"");
        });

        builder.Entity<Feedback>(feedback =>
        {
            feedback.Property(one => one.Title).HasMaxLength(Limits.Title);
            feedback.Property(one => one.Description).HasMaxLength(Limits.Description);
            feedback
                .Property(one => one.Category)
                .HasConversion(
                    value => Wire<Category>.Of(value),
                    text => Wire<Category>.Parse(text)
                )
                .HasMaxLength(Limits.Term);
            feedback
                .Property(one => one.Status)
                .HasConversion(value => Wire<Status>.Of(value), text => Wire<Status>.Parse(text))
                .HasMaxLength(Limits.Term);

            feedback
                .HasMany(one => one.Comments)
                .WithOne()
                .HasForeignKey(one => one.FeedbackId)
                .OnDelete(DeleteBehavior.Cascade);

            feedback.ToTable(table =>
            {
                table.HasCheckConstraint("ck_feedback_category", Wire.OneOf<Category>("category"));
                table.HasCheckConstraint("ck_feedback_status", Wire.OneOf<Status>("status"));
                table.HasCheckConstraint("ck_feedback_upvotes", "\"upvotes\" >= 0");
            });
        });

        builder.Entity<Comment>(comment =>
        {
            comment.Property(one => one.Content).HasMaxLength(Limits.Content);
            comment.Property(one => one.AuthorUsername).HasMaxLength(Limits.Username);

            comment
                .HasOne(one => one.Author)
                .WithMany()
                .HasForeignKey(one => one.AuthorUsername)
                .OnDelete(DeleteBehavior.Restrict);

            comment
                .HasMany(one => one.Replies)
                .WithOne()
                .HasForeignKey(one => one.CommentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Reply>(reply =>
        {
            reply.Property(one => one.Content).HasMaxLength(Limits.Content);
            reply.Property(one => one.AuthorUsername).HasMaxLength(Limits.Username);
            reply.Property(one => one.ReplyingTo).HasMaxLength(Limits.Username);

            reply
                .HasOne(one => one.Author)
                .WithMany()
                .HasForeignKey(one => one.AuthorUsername)
                .OnDelete(DeleteBehavior.Restrict);

            reply
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(one => one.ReplyingTo)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
