using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Dtos.Taxonomy;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Services.Common;

namespace XuanNha.Dev.Services.Taxonomy;

public sealed class CategoryService : ICategoryService
{
    private const int MaxSlugLength = 140;
    private readonly ApplicationDbContext _dbContext;

    public CategoryService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<CategoryDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                BlogPostCount = category.BlogPosts.Count
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbContext.Categories
            .AsNoTracking()
            .Where(category => category.Id == id)
            .Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                BlogPostCount = category.BlogPosts.Count
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CategoryDto> CreateAsync(SaveCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Name, null, cancellationToken),
            Description = NormalizeOptionalValue(request.Description)
        };

        _dbContext.Categories.Add(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(category, 0);
    }

    public async Task<CategoryDto?> UpdateAsync(Guid id, SaveCategoryRequest request, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (category is null)
        {
            return null;
        }

        category.Name = request.Name.Trim();
        category.Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Name, id, cancellationToken);
        category.Description = NormalizeOptionalValue(request.Description);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var blogPostCount = await _dbContext.BlogPosts.CountAsync(post => post.CategoryId == id, cancellationToken);

        return Map(category, blogPostCount);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var category = await _dbContext.Categories.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (category is null)
        {
            return false;
        }

        _dbContext.Categories.Remove(category);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<string> CreateUniqueSlugAsync(
        string requestedValue,
        Guid? ignoredCategoryId,
        CancellationToken cancellationToken)
    {
        var baseSlug = SlugGenerator.Create(requestedValue);

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "category";
        }

        baseSlug = TruncateSlug(baseSlug, MaxSlugLength);
        var slug = baseSlug;
        var suffix = 2;

        while (await _dbContext.Categories.AnyAsync(
                   category => category.Slug == slug
                       && (!ignoredCategoryId.HasValue || category.Id != ignoredCategoryId.Value),
                   cancellationToken))
        {
            var suffixText = $"-{suffix}";
            slug = $"{TruncateSlug(baseSlug, MaxSlugLength - suffixText.Length)}{suffixText}";
            suffix++;
        }

        return slug;
    }

    private static string TruncateSlug(string slug, int maxLength)
    {
        return slug.Length <= maxLength ? slug : slug[..maxLength].Trim('-');
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static CategoryDto Map(Category category, int blogPostCount)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description,
            BlogPostCount = blogPostCount
        };
    }
}
