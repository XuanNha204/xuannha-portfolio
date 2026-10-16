using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace XuanNha.Dev.Services.Common;

public static partial class SlugGenerator
{
    public static string Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(normalized.Length);

        foreach (var character in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(character);
            }
        }

        var slug = InvalidSlugCharacters().Replace(builder.ToString().Normalize(NormalizationForm.FormC), "-");
        slug = DuplicateDashes().Replace(slug, "-").Trim('-');

        return slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex InvalidSlugCharacters();

    [GeneratedRegex("-{2,}")]
    private static partial Regex DuplicateDashes();
}
