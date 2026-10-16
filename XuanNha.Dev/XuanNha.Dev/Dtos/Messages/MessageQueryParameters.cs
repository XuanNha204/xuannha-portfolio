namespace XuanNha.Dev.Dtos.Messages;

public sealed class MessageQueryParameters
{
    private const int MaxPageSize = 50;
    private int _pageNumber = 1;
    private int _pageSize = 20;

    public string? Search { get; set; }

    public bool? IsRead { get; set; }

    public int PageNumber
    {
        get => _pageNumber;
        set => _pageNumber = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? 20 : Math.Min(value, MaxPageSize);
    }
}
