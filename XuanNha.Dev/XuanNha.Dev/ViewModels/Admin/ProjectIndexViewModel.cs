using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Projects;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class ProjectIndexViewModel
{
    public ProjectQueryParameters Query { get; set; } = new();

    public PagedResult<ProjectListItemDto> Projects { get; set; } =
        new(Array.Empty<ProjectListItemDto>(), 1, 12, 0);
}
