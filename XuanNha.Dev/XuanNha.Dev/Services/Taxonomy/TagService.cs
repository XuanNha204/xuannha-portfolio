using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Dtos.Taxonomy;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Services.Common;

namespace XuanNha.Dev.Services.Taxonomy;

public sealed class TagService : ITagService
{
    private const int MaxSlugLength = 100;
    private readonly ApplicationDbContext _dbContext;

    public TagService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<TagDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Tags
            .AsNoTracking()
            .OrderBy(tag => tag.Name)
            .Select(tag => new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                Slug = tag.Slug,
                BlogPostCount = tag.BlogPostTags.Count,
                ProjectCount = tag.ProjectTags.Count
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<TagDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbContext.Tags
            .AsNoTracking()
            .Where(tag => tag.Id == id)
            .Select(tag => new TagDto
            {
                Id = tag.Id,
                Name = tag.Name,
                Slug = tag.Slug,
                BlogPostCount = tag.BlogPostTags.Count,
                ProjectCount = tag.ProjectTags.Count
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<TagDto> CreateAsync(SaveTagRequest request, CancellationToken cancellationToken)
    {
        var tag = new Tag
        {
            Name = request.Name.Trim(),
            Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Name, null, cancellationToken)
        };

        _dbContext.Tags.Add(tag);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new TagDto
        {
            Id = tag.Id,
            Name = tag.Name,
            Slug = tag.Slug
        };
    }

    public async Task<TagDto?> UpdateAsync(Guid id, SaveTagRequest request, CancellationToken cancellationToken)
    {
        var tag = await _dbContext.Tags.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (tag is null)
        {
            return null;
        }

        tag.Name = request.Name.Trim();
        tag.Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Name, id, cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var tag = await _dbContext.Tags.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (tag is null)
        {
            return false;
        }

        _dbContext.Tags.Remove(tag);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<string> CreateUniqueSlugAsync(
        string requestedValue,
        Guid? ignoredTagId,
        CancellationToken cancellationToken)
    {
        var baseSlug = SlugGenerator.Create(requestedValue);

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "tag";
        }

        baseSlug = TruncateSlug(baseSlug, MaxSlugLength);
        var slug = baseSlug;
        var suffix = 2;

        while (await _dbContext.Tags.AnyAsync(
                   tag => tag.Slug == slug && (!ignoredTagId.HasValue || tag.Id != ignoredTagId.Value),
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
}
