using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Entities.Content;

namespace XuanNha.Dev.Repositories.Projects;

public sealed class ProjectRepository : IProjectRepository
{
    private readonly ApplicationDbContext _dbContext;

    public ProjectRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IQueryable<Project> Query()
    {
        return _dbContext.Projects.AsNoTracking();
    }

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .Include(project => project.Images.OrderBy(image => image.SortOrder))
            .FirstOrDefaultAsync(project => project.Id == id, cancellationToken);
    }

    public Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .AsNoTracking()
            .Include(project => project.Images.OrderBy(image => image.SortOrder))
            .FirstOrDefaultAsync(project => project.Slug == slug, cancellationToken);
    }

    public Task<bool> SlugExistsAsync(string slug, Guid? ignoredProjectId, CancellationToken cancellationToken)
    {
        return _dbContext.Projects
            .AnyAsync(
                project => project.Slug == slug && (!ignoredProjectId.HasValue || project.Id != ignoredProjectId.Value),
                cancellationToken);
    }

    public Task AddAsync(Project project, CancellationToken cancellationToken)
    {
        return _dbContext.Projects.AddAsync(project, cancellationToken).AsTask();
    }

    public void Delete(Project project)
    {
        _dbContext.Projects.Remove(project);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken)
    {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
}
