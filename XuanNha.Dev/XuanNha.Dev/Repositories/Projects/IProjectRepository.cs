using XuanNha.Dev.Entities.Content;

namespace XuanNha.Dev.Repositories.Projects;

public interface IProjectRepository
{
    IQueryable<Project> Query();

    Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Project?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<bool> SlugExistsAsync(string slug, Guid? ignoredProjectId, CancellationToken cancellationToken);

    Task AddAsync(Project project, CancellationToken cancellationToken);

    void Delete(Project project);

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
