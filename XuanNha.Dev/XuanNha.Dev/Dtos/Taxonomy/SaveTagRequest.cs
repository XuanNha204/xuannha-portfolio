namespace XuanNha.Dev.Dtos.Taxonomy;

public sealed class SaveTagRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }
}
