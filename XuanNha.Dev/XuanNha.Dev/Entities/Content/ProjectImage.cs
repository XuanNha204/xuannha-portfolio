using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Content;

public class ProjectImage : AuditableEntity
{
    public Guid ProjectId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string? AltText { get; set; }

    public int SortOrder { get; set; }

    public Project? Project { get; set; }
}
