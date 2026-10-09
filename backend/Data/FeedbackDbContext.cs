using Microsoft.EntityFrameworkCore;

public class FeedbackDbContext(DbContextOptions<FeedbackDbContext> options, DatabaseSchema schema)
    : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema(schema.Name);
    }
}
