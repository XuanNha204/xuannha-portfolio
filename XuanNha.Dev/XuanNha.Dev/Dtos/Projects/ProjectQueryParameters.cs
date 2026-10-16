using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Projects;

public sealed class ProjectQueryParameters
{
    private const int MaxPageSize = 50;
    private int _pageNumber = 1;
    private int _pageSize = 12;

    public string? Search { get; set; }

    public ProjectStatus? Status { get; set; }

    public bool? Featured { get; set; }

    public string? SortBy { get; set; }

    public bool Descending { get; set; } = true;

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 12 : Math.Min(value, MaxPageSize);
    }
}
