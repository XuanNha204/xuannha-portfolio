using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Blogs;

public sealed class BlogListItemDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string? CoverImageUrl { get; set; }

    public string? CategoryName { get; set; }

    public int ReadingTimeMinutes { get; set; }

    public int ViewCount { get; set; }

    public BlogPostStatus Status { get; set; }

    public DateTimeOffset? PublishedAt { get; set; }
}
