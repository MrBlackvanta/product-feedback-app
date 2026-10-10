using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FeedbackApi.Tests;

public class RateLimitTests : IAsyncLifetime
{
    WebApplication application = null!;
    HttpClient client = null!;

    public async Task InitializeAsync()
    {
        var builder = WebApplication.CreateBuilder();

        builder.Logging.ClearProviders();
        builder.WebHost.UseTestServer();
        builder.Services.AddRateLimiter(RateLimits.Configure);

        application = builder.Build();
        application.UseRateLimiter();
        application.MapGet("/probe", () => "ok");

        await application.StartAsync();

        client = application.GetTestClient();
    }

    public async Task DisposeAsync()
    {
        client.Dispose();
        await application.DisposeAsync();
    }

    [Fact]
    public async Task LetsOneCallerThroughSixtyTimesAndThenHoldsThemBack()
    {
        for (var attempt = 1; attempt <= RateLimits.PerMinute; attempt++)
        {
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/probe")).StatusCode);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, (await client.GetAsync("/probe")).StatusCode);
    }
}
