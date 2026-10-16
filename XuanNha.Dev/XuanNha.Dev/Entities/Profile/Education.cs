using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Profile;

public class Education : AuditableEntity
{
    public string School { get; set; } = string.Empty;

    public string Major { get; set; } = string.Empty;

    public int StartYear { get; set; }

    public int? EndYear { get; set; }

    public string? Description { get; set; }
}
