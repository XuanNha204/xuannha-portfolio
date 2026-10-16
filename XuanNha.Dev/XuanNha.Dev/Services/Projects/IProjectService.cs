using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Projects;

namespace XuanNha.Dev.Services.Projects;

public interface IProjectService
{
    Task<PagedResult<ProjectListItemDto>> GetProjectsAsync(ProjectQueryParameters query, CancellationToken cancellationToken);

    Task<ProjectDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ProjectDetailDto?> GetBySlugAsync(string slug, CancellationToken cancellationToken);

    Task<ProjectDetailDto> CreateAsync(CreateProjectRequest request, CancellationToken cancellationToken);

    Task<ProjectDetailDto?> UpdateAsync(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<ProjectDetailDto?> SetFeaturedAsync(Guid id, bool featured, CancellationToken cancellationToken);
}
