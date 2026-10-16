using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class CategoryFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(140)]
    public string? Slug { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }
}
