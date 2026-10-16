using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class ExperienceFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(160)]
    public string Company { get; set; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string Position { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Date)]
    [Display(Name = "Start date")]
    public DateOnly? StartDate { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "End date (empty = present)")]
    public DateOnly? EndDate { get; set; }

    public string? Description { get; set; }
}
