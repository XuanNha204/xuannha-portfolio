using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Dtos.Common;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class BlogIndexViewModel
{
    public BlogQueryParameters Query { get; set; } = new();

    public PagedResult<BlogListItemDto> BlogPosts { get; set; } =
        new(Array.Empty<BlogListItemDto>(), 1, 12, 0);
}
