using Markdig;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Enums;
using XuanNha.Dev.Repositories.Blogs;
using XuanNha.Dev.Services.Common;

namespace XuanNha.Dev.Services.Blogs;

public sealed class BlogPostService : IBlogPostService
{
    private const int MaxSlugLength = 240;
    private const int WordsPerMinute = 220;
    private readonly IBlogPostRepository _blogPostRepository;
    private readonly MarkdownPipeline _markdownPipeline;

    public BlogPostService(IBlogPostRepository blogPostRepository)
    {
        _blogPostRepository = blogPostRepository;
        _markdownPipeline = new MarkdownPipelineBuilder()
            .UseAdvancedExtensions()
            .UseBootstrap()
            .Build();
    }

    public async Task<PagedResult<BlogListItemDto>> GetBlogPostsAsync(
        BlogQueryParameters query,
        CancellationToken cancellationToken)
    {
        var posts = _blogPostRepository.Query();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            posts = posts.Where(post =>
                post.Title.Contains(searchTerm) ||
                post.Summary.Contains(searchTerm) ||
                post.ContentMarkdown.Contains(searchTerm));
        }

        if (query.Status.HasValue)
        {
            posts = posts.Where(post => post.Status == query.Status.Value);
        }

        if (query.CategoryId.HasValue)
        {
            posts = posts.Where(post => post.CategoryId == query.CategoryId.Value);
        }

        posts = ApplySorting(posts, query);

        var totalItems = await posts.CountAsync(cancellationToken);
        var items = await posts
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(post => new BlogListItemDto
            {
                Id = post.Id,
                Title = post.Title,
                Slug = post.Slug,
                Summary = post.Summary,
                CoverImageUrl = post.CoverImageUrl,
                CategoryName = post.Category != null ? post.Category.Name : null,
                ReadingTimeMinutes = post.ReadingTimeMinutes,
                ViewCount = post.ViewCount,
                Status = post.Status,
                PublishedAt = post.PublishedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<BlogListItemDto>(items, query.PageNumber, query.PageSize, totalItems);
    }

    public async Task<BlogDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var post = await _blogPostRepository.GetByIdAsync(id, cancellationToken);
        return post is null ? null : MapDetail(post);
    }

    public async Task<BlogDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = SlugGenerator.Create(slug);
        var post = await _blogPostRepository.GetBySlugAsync(normalizedSlug, cancellationToken);
        return post is null ? null : MapDetail(post);
    }

    public async Task<BlogDetailDto> CreateAsync(
        CreateBlogPostRequest request,
        Guid? authorId,
        CancellationToken cancellationToken)
    {
        var contentMarkdown = request.ContentMarkdown.Trim();

        var post = new BlogPost
        {
            Title = request.Title.Trim(),
            Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Title, null, cancellationToken),
            Summary = request.Summary.Trim(),
            ContentMarkdown = contentMarkdown,
            ContentHtml = Markdown.ToHtml(contentMarkdown, _markdownPipeline),
            CoverImageUrl = NormalizeOptionalValue(request.CoverImageUrl),
            CategoryId = await ResolveCategoryIdAsync(request.CategoryId, cancellationToken),
            AuthorId = authorId,
            ReadingTimeMinutes = CalculateReadingTime(contentMarkdown),
            Status = request.Status,
            PublishedAt = ResolvePublishedAt(request.Status, request.PublishedAt)
        };

        await _blogPostRepository.AddAsync(post, cancellationToken);
        await _blogPostRepository.SaveChangesAsync(cancellationToken);

        var detail = MapDetail(post);
        detail.CategoryName = post.CategoryId.HasValue
            ? await _blogPostRepository.GetCategoryNameAsync(post.CategoryId.Value, cancellationToken)
            : null;

        return detail;
    }

    public async Task<BlogDetailDto?> UpdateAsync(
        Guid id,
        UpdateBlogPostRequest request,
        CancellationToken cancellationToken)
    {
        var post = await _blogPostRepository.GetByIdAsync(id, cancellationToken);

        if (post is null)
        {
            return null;
        }

        var contentMarkdown = request.ContentMarkdown.Trim();

        post.Title = request.Title.Trim();
        post.Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Title, id, cancellationToken);
        post.Summary = request.Summary.Trim();
        post.ContentMarkdown = contentMarkdown;
        post.ContentHtml = Markdown.ToHtml(contentMarkdown, _markdownPipeline);
        post.CoverImageUrl = NormalizeOptionalValue(request.CoverImageUrl);
        post.CategoryId = await ResolveCategoryIdAsync(request.CategoryId, cancellationToken);
        post.ReadingTimeMinutes = CalculateReadingTime(contentMarkdown);
        post.Status = request.Status;
        post.PublishedAt = ResolvePublishedAt(request.Status, request.PublishedAt);

        await _blogPostRepository.SaveChangesAsync(cancellationToken);

        var detail = MapDetail(post);
        detail.CategoryName = post.CategoryId.HasValue
            ? await _blogPostRepository.GetCategoryNameAsync(post.CategoryId.Value, cancellationToken)
            : null;

        return detail;
    }

    public Task RegisterViewAsync(Guid id, CancellationToken cancellationToken)
    {
        return _blogPostRepository.IncrementViewCountAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var post = await _blogPostRepository.GetByIdAsync(id, cancellationToken);

        if (post is null)
        {
            return false;
        }

        _blogPostRepository.Delete(post);
        await _blogPostRepository.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<BlogDetailDto?> SetStatusAsync(
        Guid id,
        BlogPostStatus status,
        CancellationToken cancellationToken)
    {
        var post = await _blogPostRepository.GetByIdAsync(id, cancellationToken);

        if (post is null)
        {
            return null;
        }

        post.Status = status;
        post.PublishedAt = ResolvePublishedAt(status, post.PublishedAt);

        await _blogPostRepository.SaveChangesAsync(cancellationToken);

        return MapDetail(post);
    }

    private static IQueryable<BlogPost> ApplySorting(IQueryable<BlogPost> posts, BlogQueryParameters query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return sortBy switch
        {
            "title" => query.Descending
                ? posts.OrderByDescending(post => post.Title)
                : posts.OrderBy(post => post.Title),
            "publishedat" => query.Descending
                ? posts.OrderByDescending(post => post.PublishedAt)
                : posts.OrderBy(post => post.PublishedAt),
            "views" => query.Descending
                ? posts.OrderByDescending(post => post.ViewCount)
                : posts.OrderBy(post => post.ViewCount),
            _ => query.Descending
                ? posts.OrderByDescending(post => post.CreatedAt)
                : posts.OrderBy(post => post.CreatedAt)
        };
    }

    private async Task<string> CreateUniqueSlugAsync(
        string requestedValue,
        Guid? ignoredBlogPostId,
        CancellationToken cancellationToken)
    {
        var baseSlug = SlugGenerator.Create(requestedValue);

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "blog-post";
        }

        baseSlug = TruncateSlug(baseSlug, MaxSlugLength);
        var slug = baseSlug;
        var suffix = 2;

        while (await _blogPostRepository.SlugExistsAsync(slug, ignoredBlogPostId, cancellationToken))
        {
            var suffixText = $"-{suffix}";
            slug = $"{TruncateSlug(baseSlug, MaxSlugLength - suffixText.Length)}{suffixText}";
            suffix++;
        }

        return slug;
    }

    private static int CalculateReadingTime(string markdown)
    {
        var wordCount = markdown
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)
            .Length;

        return Math.Max(1, (int)Math.Ceiling((double)wordCount / WordsPerMinute));
    }

    private static DateTimeOffset? ResolvePublishedAt(BlogPostStatus status, DateTimeOffset? requestedPublishedAt)
    {
        if (status != BlogPostStatus.Published)
        {
            return requestedPublishedAt;
        }

        return requestedPublishedAt ?? DateTimeOffset.UtcNow;
    }

    private static string TruncateSlug(string slug, int maxLength)
    {
        return slug.Length <= maxLength ? slug : slug[..maxLength].Trim('-');
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private async Task<Guid?> ResolveCategoryIdAsync(Guid? categoryId, CancellationToken cancellationToken)
    {
        if (!categoryId.HasValue)
        {
            return null;
        }

        var exists = await _blogPostRepository.CategoryExistsAsync(categoryId.Value, cancellationToken);
        return exists ? categoryId : null;
    }

    private static BlogDetailDto MapDetail(BlogPost post)
    {
        return new BlogDetailDto
        {
            Id = post.Id,
            Title = post.Title,
            Slug = post.Slug,
            Summary = post.Summary,
            ContentMarkdown = post.ContentMarkdown,
            ContentHtml = post.ContentHtml,
            CoverImageUrl = post.CoverImageUrl,
            CategoryId = post.CategoryId,
            CategoryName = post.Category?.Name,
            ReadingTimeMinutes = post.ReadingTimeMinutes,
            ViewCount = post.ViewCount,
            Status = post.Status,
            PublishedAt = post.PublishedAt
        };
    }
}
