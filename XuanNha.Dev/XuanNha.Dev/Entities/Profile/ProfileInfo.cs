using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Profile;

public class ProfileInfo : AuditableEntity
{
    public string Headline { get; set; } = string.Empty;

    public string AboutMe { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public string? ResumeUrl { get; set; }

    public string? Location { get; set; }
}
