using System.ComponentModel.DataAnnotations;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Blogs;

public sealed class CreateBlogPostRequest
{
    [Required]
    [StringLength(220)]
    public string Title { get; set; } = string.Empty;

    [StringLength(240)]
    public string? Slug { get; set; }

    [Required]
    [StringLength(600)]
    public string Summary { get; set; } = string.Empty;

    [Required]
    public string ContentMarkdown { get; set; } = string.Empty;

    [StringLength(500)]
    public string? CoverImageUrl { get; set; }

    public Guid? CategoryId { get; set; }

    public BlogPostStatus Status { get; set; } = BlogPostStatus.Draft;

    public DateTimeOffset? PublishedAt { get; set; }
}
