using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class SkillFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(120)]
    [Display(Name = "Group")]
    public string? GroupName { get; set; }

    [Range(0, 100)]
    [Display(Name = "Level (0–100, 0 hides the bar)")]
    public int Level { get; set; }

    [MaxLength(500)]
    [Display(Name = "Icon URL")]
    public string? IconUrl { get; set; }

    [Display(Name = "Sort order")]
    public int SortOrder { get; set; }
}
