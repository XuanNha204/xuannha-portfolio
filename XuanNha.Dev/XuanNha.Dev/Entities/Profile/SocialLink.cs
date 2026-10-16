using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Profile;

public class SocialLink : AuditableEntity
{
    public string Platform { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string? IconUrl { get; set; }

    public int DisplayOrder { get; set; }
}
