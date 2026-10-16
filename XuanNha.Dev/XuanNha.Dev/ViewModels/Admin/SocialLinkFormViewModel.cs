using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class SocialLinkFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(80)]
    public string Platform { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    [Url]
    public string Url { get; set; } = string.Empty;

    [MaxLength(500)]
    [Display(Name = "Icon URL")]
    public string? IconUrl { get; set; }

    [Display(Name = "Display order")]
    public int DisplayOrder { get; set; }
}
