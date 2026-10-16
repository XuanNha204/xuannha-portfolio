namespace XuanNha.Dev.Entities.Content;

public class SiteSetting
{
    public string Key { get; set; } = string.Empty;

    public string Value { get; set; } = string.Empty;

    public string? GroupName { get; set; }

    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
