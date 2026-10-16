using XuanNha.Dev.Entities.Common;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Entities.Content;

public class Project : AuditableEntity
{
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

    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;

    public bool Featured { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public ICollection<ProjectImage> Images { get; set; } = new List<ProjectImage>();

    public ICollection<ProjectTag> ProjectTags { get; set; } = new List<ProjectTag>();
}
