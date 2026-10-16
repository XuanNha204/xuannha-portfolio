using System.ComponentModel.DataAnnotations;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class ProjectFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(220)]
    public string? Slug { get; set; }

    [Required]
    [StringLength(500)]
    public string Summary { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [StringLength(500)]
    public string? ThumbnailUrl { get; set; }

    [StringLength(500)]
    public string? GithubUrl { get; set; }

    [StringLength(500)]
    public string? DemoUrl { get; set; }

    [StringLength(500)]
    public string? VideoUrl { get; set; }

    [Required]
    public string TechnologyStack { get; set; } = string.Empty;

    public string? Role { get; set; }

    public string? Challenges { get; set; }

    public string? Solutions { get; set; }

    public string? Results { get; set; }

    public ProjectStatus Status { get; set; } = ProjectStatus.Draft;

    public bool Featured { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }

    public string? GalleryImagesText { get; set; }
}
