using System.ComponentModel.DataAnnotations;

namespace XuanNha.Dev.Dtos.Messages;

public sealed class CreateContactMessageRequest
{
    [Required]
    [StringLength(160)]
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
    public string Content { get; set; } = string.Empty;
}
