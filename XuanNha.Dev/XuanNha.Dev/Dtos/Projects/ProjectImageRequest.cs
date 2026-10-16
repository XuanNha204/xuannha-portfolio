using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.Dtos.Projects;

public sealed class ProjectImageRequest
{
    [Required]
    [StringLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [StringLength(200)]
    public string? AltText { get; set; }

    public int SortOrder { get; set; }
}
