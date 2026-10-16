using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Media;

namespace XuanNha.Dev.Services.Media;

public interface IMediaService
{
    Task<PagedResult<MediaFileDto>> GetMediaFilesAsync(MediaQueryParameters query, CancellationToken cancellationToken);

    Task<MediaUploadResult> UploadAsync(IReadOnlyCollection<IFormFile> files, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
