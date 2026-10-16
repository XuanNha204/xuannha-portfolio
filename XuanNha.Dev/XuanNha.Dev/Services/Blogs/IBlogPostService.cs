using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Services.Blogs;

public interface IBlogPostService
{
    Task<PagedResult<BlogListItemDto>> GetBlogPostsAsync(BlogQueryParameters query, CancellationToken cancellationToken);

    Task<BlogDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<BlogDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<BlogDetailDto> CreateAsync(CreateBlogPostRequest request, Guid? authorId, CancellationToken cancellationToken);

    Task<BlogDetailDto?> UpdateAsync(Guid id, UpdateBlogPostRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<BlogDetailDto?> SetStatusAsync(Guid id, BlogPostStatus status, CancellationToken cancellationToken);

    Task RegisterViewAsync(Guid id, CancellationToken cancellationToken);
}
