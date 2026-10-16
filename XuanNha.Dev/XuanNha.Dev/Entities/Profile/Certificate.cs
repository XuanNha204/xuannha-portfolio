using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Profile;

public class Certificate : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string Issuer { get; set; } = string.Empty;

    public DateOnly? IssuedAt { get; set; }

    public string? CredentialUrl { get; set; }
}
