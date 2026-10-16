using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class ProfileFormViewModel
{
    [MaxLength(220)]
    public string? Headline { get; set; }

    [Display(Name = "About me")]
    public string? AboutMe { get; set; }

    [MaxLength(500)]
    [Display(Name = "Avatar URL")]
    public string? AvatarUrl { get; set; }

    [MaxLength(500)]
    [Display(Name = "Resume/CV URL")]
    public string? ResumeUrl { get; set; }

    [MaxLength(160)]
    public string? Location { get; set; }
}
