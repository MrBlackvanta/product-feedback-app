using Microsoft.AspNetCore.Http.HttpResults;

public sealed class Checks
{
    readonly Dictionary<string, string[]> errors = [];

    public string Text(string field, string? value, int limit)
    {
        var trimmed = value?.Trim() ?? string.Empty;

        if (trimmed.Length == 0)
        {
            Reject(field, "Required.");
        }
        else if (trimmed.Length > limit)
        {
            Reject(field, $"Must be {limit} characters or fewer.");
        }

        return trimmed;
    }

    public TValue Chosen<TValue>(string field, TValue? value)
        where TValue : struct
    {
        if (value is null)
        {
            Reject(field, "Required.");
        }

        return value ?? default;
    }

    public void Reject(string field, string message) => errors[field] = [message];

    public bool Failed(out ValidationProblem problem)
    {
        problem = TypedResults.ValidationProblem(errors);

        return errors.Count > 0;
    }
}
