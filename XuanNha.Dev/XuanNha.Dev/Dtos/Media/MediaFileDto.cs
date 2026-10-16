using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Dtos.Media;

public sealed class MediaFileDto
{
    public Guid Id { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public MediaFileType FileType { get; set; }

    public string ContentType { get; set; } = string.Empty;

    public long SizeInBytes { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
