using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Media;

public sealed class MediaQueryParameters
{
    private const int MaxPageSize = 100;
    private int _pageNumber = 1;
    private int _pageSize = 24;

    public string? Search { get; set; }

    public MediaFileType? FileType { get; set; }

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 24 : Math.Min(value, MaxPageSize);
    }
}
