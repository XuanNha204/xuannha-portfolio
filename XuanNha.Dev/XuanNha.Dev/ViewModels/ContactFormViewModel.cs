using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels;

public sealed class ContactFormViewModel
{
    [Required]
    [StringLength(160)]
    [Display(Name = "Full name")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(220)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [StringLength(4000)]
    [Display(Name = "Message")]
    public string Content { get; set; } = string.Empty;

    // Honeypot field: real users never fill this in, bots do.
    public string? Website { get; set; }
}
