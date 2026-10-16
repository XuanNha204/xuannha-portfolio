using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Projects;

namespace XuanNha.Dev.ViewModels;

public sealed class ProjectListViewModel
{
    public string? Search { get; set; }

    public PagedResult<ProjectListItemDto> Projects { get; set; } =
        new(Array.Empty<ProjectListItemDto>(), 1, 12, 0);
}
