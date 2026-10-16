namespace XuanNha.Dev.Dtos.Taxonomy;

public sealed class TagDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public int BlogPostCount { get; set; }

    public int ProjectCount { get; set; }
}
