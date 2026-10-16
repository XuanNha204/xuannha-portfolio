using XuanNha.Dev.Entities.Content;

namespace XuanNha.Dev.Repositories.Blogs;

public interface IBlogPostRepository
{
    IQueryable<BlogPost> Query();

    Task<BlogPost?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<bool> SlugExistsAsync(string slug, Guid? ignoredBlogPostId, CancellationToken cancellationToken);

    Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken);

    Task<string?> GetCategoryNameAsync(Guid categoryId, CancellationToken cancellationToken);

    Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(BlogPost blogPost, CancellationToken cancellationToken);

    void Delete(BlogPost blogPost);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
