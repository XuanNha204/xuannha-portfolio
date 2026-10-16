using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Projects;

public sealed class ProjectDetailDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? ThumbnailUrl { get; set; }

    public string? GithubUrl { get; set; }

    public string? DemoUrl { get; set; }

    public string? VideoUrl { get; set; }

    public string TechnologyStack { get; set; } = string.Empty;

    public string? Role { get; set; }

    public string? Challenges { get; set; }

    public string? Solutions { get; set; }

    public string? Results { get; set; }

    public ProjectStatus Status { get; set; }

    public bool Featured { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public IReadOnlyCollection<ProjectImageDto> Images { get; set; } = Array.Empty<ProjectImageDto>();
}
