using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Content;

public class Category : AuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string? Description { get; set; }

    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
}
