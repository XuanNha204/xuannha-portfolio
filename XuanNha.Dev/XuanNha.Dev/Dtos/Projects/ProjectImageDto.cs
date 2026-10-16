namespace XuanNha.Dev.Dtos.Projects;

public sealed class ProjectImageDto
{
    public Guid Id { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? AltText { get; set; }

    public int SortOrder { get; set; }
}
