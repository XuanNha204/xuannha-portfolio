namespace XuanNha.Dev.Dtos.Media;

public sealed class MediaUploadResult
{
    public List<MediaFileDto> Uploaded { get; } = [];

    public List<string> Errors { get; } = [];
}
