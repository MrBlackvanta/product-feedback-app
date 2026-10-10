using System.Collections.Frozen;
using System.Text.Json;
using System.Text.Json.Serialization;

public static class Wire
{
    public static readonly JsonNamingPolicy Names = JsonNamingPolicy.KebabCaseLower;

    public static JsonStringEnumConverter Enums() => new(Names);

    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { Enums() },
    };

    public static string OneOf<TEnum>(string column)
        where TEnum : struct, Enum =>
        $"\"{column}\" in ({string.Join(", ", Enum.GetValues<TEnum>().Select(value => $"'{Wire<TEnum>.Of(value)}'"))})";
}

public static class Wire<TEnum>
    where TEnum : struct, Enum
{
    static readonly FrozenDictionary<TEnum, string> Text = Enum.GetValues<TEnum>()
        .ToFrozenDictionary(value => value, value => Wire.Names.ConvertName(value.ToString()));

    static readonly FrozenDictionary<string, TEnum> Known = Enum.GetValues<TEnum>()
        .ToFrozenDictionary(Of, value => value);

    public static string Of(TEnum value) => Text[value];

    public static TEnum Parse(string text) =>
        Known.TryGetValue(text, out var value)
            ? value
            : throw new InvalidOperationException($"'{text}' is not a known {typeof(TEnum).Name}.");
}
