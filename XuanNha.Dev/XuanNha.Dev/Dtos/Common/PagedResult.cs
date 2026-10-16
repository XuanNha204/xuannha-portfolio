namespace XuanNha.Dev.Dtos.Common;

public sealed class PagedResult<T>
{
    public PagedResult(IReadOnlyCollection<T> items, int pageNumber, int pageSize, int totalItems)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalItems = totalItems;
    }

    public IReadOnlyCollection<T> Items { get; }

    public int PageNumber { get; }

    public int PageSize { get; }

    public int TotalItems { get; }

    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling((double)TotalItems / PageSize);

    public bool HasPreviousPage => PageNumber > 1;

    public bool HasNextPage => PageNumber < TotalPages;
}
