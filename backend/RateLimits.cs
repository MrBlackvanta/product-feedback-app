using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

public static class RateLimits
{
    public const int PerMinute = 60;

    public static void Configure(RateLimiterOptions options)
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
            RateLimitPartition.GetFixedWindowLimiter(
                context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = PerMinute,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                }
            )
        );
    }
}
