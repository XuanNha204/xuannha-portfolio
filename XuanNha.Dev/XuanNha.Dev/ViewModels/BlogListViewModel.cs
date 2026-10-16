using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Dtos.Common;

namespace XuanNha.Dev.ViewModels;

public sealed class BlogListViewModel
{
    public string? Search { get; set; }

    public PagedResult<BlogListItemDto> BlogPosts { get; set; } =
        new(Array.Empty<BlogListItemDto>(), 1, 12, 0);
}
