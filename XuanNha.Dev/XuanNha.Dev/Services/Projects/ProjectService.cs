using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Projects;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Enums;
using XuanNha.Dev.Repositories.Projects;
using XuanNha.Dev.Services.Common;

namespace XuanNha.Dev.Services.Projects;

public sealed class ProjectService : IProjectService
{
    private const int MaxSlugLength = 220;
    private readonly IProjectRepository _projectRepository;

    public ProjectService(IProjectRepository projectRepository)
    {
        _projectRepository = projectRepository;
    }

    public async Task<PagedResult<ProjectListItemDto>> GetProjectsAsync(
        ProjectQueryParameters query,
        CancellationToken cancellationToken)
    {
        var projects = _projectRepository.Query();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            projects = projects.Where(project =>
                project.Title.Contains(searchTerm) ||
                project.Summary.Contains(searchTerm) ||
                project.TechnologyStack.Contains(searchTerm));
        }

        if (query.Status.HasValue)
        {
            projects = projects.Where(project => project.Status == query.Status.Value);
        }

        if (query.Featured.HasValue)
        {
            projects = projects.Where(project => project.Featured == query.Featured.Value);
        }

        projects = ApplySorting(projects, query);

        var totalItems = await projects.CountAsync(cancellationToken);
        var items = await projects
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(project => new ProjectListItemDto
            {
                Id = project.Id,
                Title = project.Title,
                Slug = project.Slug,
                Summary = project.Summary,
                ThumbnailUrl = project.ThumbnailUrl,
                TechnologyStack = project.TechnologyStack,
                Status = project.Status,
                Featured = project.Featured,
                PublishedAt = project.PublishedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ProjectListItemDto>(items, query.PageNumber, query.PageSize, totalItems);
    }

    public async Task<ProjectDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);
        return project is null ? null : MapDetail(project);
    }

    public async Task<ProjectDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var normalizedSlug = SlugGenerator.Create(slug);
        var project = await _projectRepository.GetBySlugAsync(normalizedSlug, cancellationToken);
        return project is null ? null : MapDetail(project);
    }

    public async Task<ProjectDetailDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            Title = request.Title.Trim(),
            Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Title, null, cancellationToken),
            Summary = request.Summary.Trim(),
            Description = request.Description,
            ThumbnailUrl = NormalizeOptionalValue(request.ThumbnailUrl),
            GithubUrl = NormalizeOptionalValue(request.GithubUrl),
            DemoUrl = NormalizeOptionalValue(request.DemoUrl),
            VideoUrl = NormalizeOptionalValue(request.VideoUrl),
            TechnologyStack = request.TechnologyStack.Trim(),
            Role = NormalizeOptionalValue(request.Role),
            Challenges = NormalizeOptionalValue(request.Challenges),
            Solutions = NormalizeOptionalValue(request.Solutions),
            Results = NormalizeOptionalValue(request.Results),
            Status = request.Status,
            Featured = request.Featured,
            PublishedAt = ResolvePublishedAt(request.Status, request.PublishedAt)
        };

        foreach (var image in request.Images.OrderBy(image => image.SortOrder))
        {
            project.Images.Add(MapImage(image));
        }

        await _projectRepository.AddAsync(project, cancellationToken);
        await _projectRepository.SaveChangesAsync(cancellationToken);

        return MapDetail(project);
    }

    public async Task<ProjectDetailDto?> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return null;
        }

        project.Title = request.Title.Trim();
        project.Slug = await CreateUniqueSlugAsync(request.Slug ?? request.Title, id, cancellationToken);
        project.Summary = request.Summary.Trim();
        project.Description = request.Description;
        project.ThumbnailUrl = NormalizeOptionalValue(request.ThumbnailUrl);
        project.GithubUrl = NormalizeOptionalValue(request.GithubUrl);
        project.DemoUrl = NormalizeOptionalValue(request.DemoUrl);
        project.VideoUrl = NormalizeOptionalValue(request.VideoUrl);
        project.TechnologyStack = request.TechnologyStack.Trim();
        project.Role = NormalizeOptionalValue(request.Role);
        project.Challenges = NormalizeOptionalValue(request.Challenges);
        project.Solutions = NormalizeOptionalValue(request.Solutions);
        project.Results = NormalizeOptionalValue(request.Results);
        project.Status = request.Status;
        project.Featured = request.Featured;
        project.PublishedAt = ResolvePublishedAt(request.Status, request.PublishedAt);

        project.Images.Clear();
        foreach (var image in request.Images.OrderBy(image => image.SortOrder))
        {
            project.Images.Add(MapImage(image));
        }

        await _projectRepository.SaveChangesAsync(cancellationToken);

        return MapDetail(project);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return false;
        }

        _projectRepository.Delete(project);
        await _projectRepository.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<ProjectDetailDto?> SetFeaturedAsync(Guid id, bool featured, CancellationToken cancellationToken)
    {
        var project = await _projectRepository.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return null;
        }

        project.Featured = featured;
        await _projectRepository.SaveChangesAsync(cancellationToken);

        return MapDetail(project);
    }

    private static IQueryable<Project> ApplySorting(IQueryable<Project> projects, ProjectQueryParameters query)
    {
        var sortBy = query.SortBy?.Trim().ToLowerInvariant();

        return sortBy switch
        {
            "title" => query.Descending
                ? projects.OrderByDescending(project => project.Title)
                : projects.OrderBy(project => project.Title),
            "publishedat" => query.Descending
                ? projects.OrderByDescending(project => project.PublishedAt)
                : projects.OrderBy(project => project.PublishedAt),
            "featured" => query.Descending
                ? projects.OrderByDescending(project => project.Featured).ThenByDescending(project => project.PublishedAt)
                : projects.OrderBy(project => project.Featured).ThenBy(project => project.PublishedAt),
            _ => query.Descending
                ? projects.OrderByDescending(project => project.CreatedAt)
                : projects.OrderBy(project => project.CreatedAt)
        };
    }

    private async Task<string> CreateUniqueSlugAsync(
        string requestedValue,
        Guid? ignoredProjectId,
        CancellationToken cancellationToken)
    {
        var baseSlug = SlugGenerator.Create(requestedValue);

        if (string.IsNullOrWhiteSpace(baseSlug))
        {
            baseSlug = "project";
        }

        baseSlug = TruncateSlug(baseSlug, MaxSlugLength);
        var slug = baseSlug;
        var suffix = 2;

        while (await _projectRepository.SlugExistsAsync(slug, ignoredProjectId, cancellationToken))
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

    private static DateTimeOffset? ResolvePublishedAt(ProjectStatus status, DateTimeOffset? requestedPublishedAt)
    {
        if (status != ProjectStatus.Published)
        {
            return requestedPublishedAt;
        }

        return requestedPublishedAt ?? DateTimeOffset.UtcNow;
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static ProjectImage MapImage(ProjectImageRequest request)
    {
        return new ProjectImage
        {
            ImageUrl = request.ImageUrl.Trim(),
            AltText = NormalizeOptionalValue(request.AltText),
            SortOrder = request.SortOrder
        };
    }

    private static ProjectDetailDto MapDetail(Project project)
    {
        return new ProjectDetailDto
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            Summary = project.Summary,
            Description = project.Description,
            ThumbnailUrl = project.ThumbnailUrl,
            GithubUrl = project.GithubUrl,
            DemoUrl = project.DemoUrl,
            VideoUrl = project.VideoUrl,
            TechnologyStack = project.TechnologyStack,
            Role = project.Role,
            Challenges = project.Challenges,
            Solutions = project.Solutions,
            Results = project.Results,
            Status = project.Status,
            Featured = project.Featured,
            PublishedAt = project.PublishedAt,
            Images = project.Images
                .OrderBy(image => image.SortOrder)
                .Select(image => new ProjectImageDto
                {
                    Id = image.Id,
                    ImageUrl = image.ImageUrl,
                    AltText = image.AltText,
                    SortOrder = image.SortOrder
                })
                .ToList()
        };
    }
}
