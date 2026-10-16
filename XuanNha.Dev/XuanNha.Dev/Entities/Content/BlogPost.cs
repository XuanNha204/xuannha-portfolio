using XuanNha.Dev.Entities.Common;
using XuanNha.Dev.Entities.Identity;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Entities.Content;

public class BlogPost : AuditableEntity
{
    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string ContentMarkdown { get; set; } = string.Empty;

    public string ContentHtml { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    public Guid? CategoryId { get; set; }

    public Guid? AuthorId { get; set; }

    public int ReadingTimeMinutes { get; set; }

    public int ViewCount { get; set; }

    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;

    public DateTimeOffset? PublishedAt { get; set; }

    public Category? Category { get; set; }

    public ApplicationUser? Author { get; set; }

    public ICollection<BlogPostTag> BlogPostTags { get; set; } = new List<BlogPostTag>();
}
