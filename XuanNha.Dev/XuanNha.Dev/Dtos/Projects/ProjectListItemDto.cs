using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Projects;

public sealed class ProjectListItemDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string? ThumbnailUrl { get; set; }

    public string TechnologyStack { get; set; } = string.Empty;

    public ProjectStatus Status { get; set; }

    public bool Featured { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }
}
