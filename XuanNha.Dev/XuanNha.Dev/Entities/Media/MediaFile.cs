using XuanNha.Dev.Entities.Common;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Entities.Media;

public class MediaFile : AuditableEntity
{
    public string FileName { get; set; } = string.Empty;

    public string OriginalFileName { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public MediaFileType FileType { get; set; } = MediaFileType.Other;

    public string ContentType { get; set; } = string.Empty;

    public long SizeInBytes { get; set; }
}
