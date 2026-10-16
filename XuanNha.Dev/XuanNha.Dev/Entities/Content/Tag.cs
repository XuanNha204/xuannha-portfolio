using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Content;

public class Tag : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public ICollection<BlogPostTag> BlogPostTags { get; set; } = new List<BlogPostTag>();

    public ICollection<ProjectTag> ProjectTags { get; set; } = new List<ProjectTag>();
}
