using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class TagFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Slug { get; set; }
}
