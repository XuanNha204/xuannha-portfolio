using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Media;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class MediaIndexViewModel
{
    public MediaQueryParameters Query { get; set; } = new();

    public PagedResult<MediaFileDto> MediaFiles { get; set; } =
        new(Array.Empty<MediaFileDto>(), 1, 24, 0);
}
