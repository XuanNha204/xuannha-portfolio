using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Entities.Content;

namespace XuanNha.Dev.Repositories.Blogs;

public sealed class BlogPostRepository : IBlogPostRepository
{
    private readonly ApplicationDbContext _dbContext;

    public BlogPostRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IQueryable<BlogPost> Query()
    {
        return _dbContext.BlogPosts.AsNoTracking();
    }

    public Task<BlogPost?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.BlogPosts
            .Include(post => post.Category)
            .FirstOrDefaultAsync(post => post.Id == id, cancellationToken);
    }

    public Task<BlogPost?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return _dbContext.BlogPosts
            .AsNoTracking()
            .Include(post => post.Category)
            .FirstOrDefaultAsync(post => post.Slug == slug, cancellationToken);
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? ignoredBlogPostId, CancellationToken cancellationToken)
    {
        return _dbContext.BlogPosts
            .AnyAsync(
                post => post.Slug == slug && (!ignoredBlogPostId.HasValue || post.Id != ignoredBlogPostId.Value),
                cancellationToken);
    }

    public Task<bool> CategoryExistsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        return _dbContext.Categories.AnyAsync(category => category.Id == categoryId, cancellationToken);
    }

    public Task<string?> GetCategoryNameAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        return _dbContext.Categories
            .Where(category => category.Id == categoryId)
            .Select(category => (string?)category.Name)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task IncrementViewCountAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.BlogPosts
            .Where(post => post.Id == id)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(post => post.ViewCount, post => post.ViewCount + 1),
                cancellationToken);
    }

    public Task AddAsync(BlogPost blogPost, CancellationToken cancellationToken)
    {
        return _dbContext.BlogPosts.AddAsync(blogPost, cancellationToken).AsTask();
    }

    public void Delete(BlogPost blogPost)
    {
        _dbContext.BlogPosts.Remove(blogPost);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
