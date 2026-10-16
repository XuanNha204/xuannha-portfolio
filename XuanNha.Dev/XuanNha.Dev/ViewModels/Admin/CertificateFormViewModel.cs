using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class CertificateFormViewModel
{
    public Guid? Id { get; set; }

    [Required]
    [MaxLength(180)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(180)]
    public string? Issuer { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "Issued at")]
    public DateOnly? IssuedAt { get; set; }

    [MaxLength(500)]
    [Display(Name = "Credential URL")]
    public string? CredentialUrl { get; set; }
}
