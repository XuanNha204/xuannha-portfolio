using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Content;

public class Skill : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string GroupName { get; set; } = string.Empty;

    public int Level { get; set; }

    public string? IconUrl { get; set; }

    public int SortOrder { get; set; }
}
