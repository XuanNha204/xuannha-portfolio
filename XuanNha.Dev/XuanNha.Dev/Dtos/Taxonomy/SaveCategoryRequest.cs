namespace XuanNha.Dev.Dtos.Taxonomy;

public sealed class SaveCategoryRequest
{
    public string Name { get; set; } = string.Empty;

    public string? Slug { get; set; }

    public string? Description { get; set; }
}
