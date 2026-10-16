using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Profile;

public class Experience : AuditableEntity
{
    public string Company { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string Description { get; set; } = string.Empty;
}
