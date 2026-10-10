using System.Text.Json.Nodes;

namespace FeedbackApi.Tests;

public abstract class BoardTests : IAsyncLifetime
{
    protected Board Board { get; } = new();

    protected HttpClient Client => Board.Client;

    public Task InitializeAsync() => Board.InitializeAsync();

    public Task DisposeAsync() => Board.DisposeAsync();
}

internal static class Responses
{
    public static async Task<JsonNode> BodyAsync(this HttpResponseMessage response) =>
        JsonNode.Parse(await response.Content.ReadAsStringAsync())
        ?? throw new InvalidOperationException("The response carried no JSON body.");

    public static async Task<JsonArray> ArrayAsync(this HttpResponseMessage response) =>
        (await response.BodyAsync()).AsArray();

    public static string Text(this JsonNode node, string field) => node[field]!.GetValue<string>();

    public static int Number(this JsonNode node, string field) => node[field]!.GetValue<int>();

    public static JsonArray List(this JsonNode node, string field) => node[field]!.AsArray();

    public static JsonNode At(this JsonArray items, int index) => items[index]!;
}
