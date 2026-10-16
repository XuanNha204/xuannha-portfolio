using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class EducationFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(180)]
    public string School { get; set; } = string.Empty;

    [MaxLength(180)]
    public string? Major { get; set; }

    [Required]
    [Range(1950, 2100)]
    [Display(Name = "Start year")]
    public int? StartYear { get; set; }

    [Range(1950, 2100)]
    [Display(Name = "End year (empty = present)")]
    public int? EndYear { get; set; }

    [MaxLength(800)]
    public string? Description { get; set; }
}
