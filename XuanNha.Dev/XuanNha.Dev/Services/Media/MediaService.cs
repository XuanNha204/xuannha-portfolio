using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Media;
using XuanNha.Dev.Entities.Media;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Services.Media;

public sealed class MediaService : IMediaService
{
    private const string UploadRootFolder = "uploads";

    private static readonly Dictionary<string, (MediaFileType FileType, long MaxSizeInBytes)> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = (MediaFileType.Image, 10 * 1024 * 1024),
            [".jpeg"] = (MediaFileType.Image, 10 * 1024 * 1024),
            [".png"] = (MediaFileType.Image, 10 * 1024 * 1024),
            [".gif"] = (MediaFileType.Image, 10 * 1024 * 1024),
            [".webp"] = (MediaFileType.Image, 10 * 1024 * 1024),
            [".svg"] = (MediaFileType.Image, 2 * 1024 * 1024),
            [".mp4"] = (MediaFileType.Video, 200 * 1024 * 1024),
            [".webm"] = (MediaFileType.Video, 200 * 1024 * 1024),
            [".pdf"] = (MediaFileType.Pdf, 25 * 1024 * 1024),
            [".doc"] = (MediaFileType.Document, 15 * 1024 * 1024),
            [".docx"] = (MediaFileType.Document, 15 * 1024 * 1024),
            [".txt"] = (MediaFileType.Document, 2 * 1024 * 1024)
        };

    private readonly ApplicationDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<MediaService> _logger;

    public MediaService(
        ApplicationDbContext dbContext,
        IWebHostEnvironment environment,
        ILogger<MediaService> logger)
    {
        _dbContext = dbContext;
        _environment = environment;
        _logger = logger;
    }

    public async Task<PagedResult<MediaFileDto>> GetMediaFilesAsync(
        MediaQueryParameters query,
        CancellationToken cancellationToken)
    {
        var files = _dbContext.MediaFiles.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            files = files.Where(file =>
                file.FileName.Contains(searchTerm) ||
                file.OriginalFileName.Contains(searchTerm));
        }

        if (query.FileType.HasValue)
        {
            files = files.Where(file => file.FileType == query.FileType.Value);
        }

        files = files.OrderByDescending(file => file.CreatedAt);

        var totalItems = await files.CountAsync(cancellationToken);
        var items = await files
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(file => new MediaFileDto
            {
                Id = file.Id,
                FileName = file.FileName,
                OriginalFileName = file.OriginalFileName,
                Url = file.Url,
                FileType = file.FileType,
                ContentType = file.ContentType,
                SizeInBytes = file.SizeInBytes,
                CreatedAt = file.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<MediaFileDto>(items, query.PageNumber, query.PageSize, totalItems);
    }

    public async Task<MediaUploadResult> UploadAsync(
        IReadOnlyCollection<IFormFile> files,
        CancellationToken cancellationToken)
    {
        var result = new MediaUploadResult();

        if (files.Count == 0)
        {
            result.Errors.Add("No files were selected.");
            return result;
        }

        var monthFolder = DateTimeOffset.UtcNow.ToString("yyyy-MM");
        var relativeFolder = Path.Combine(UploadRootFolder, monthFolder);
        var absoluteFolder = Path.Combine(_environment.WebRootPath, relativeFolder);
        Directory.CreateDirectory(absoluteFolder);

        foreach (var file in files)
        {
            if (file.Length == 0)
            {
                result.Errors.Add($"{file.FileName}: file is empty.");
                continue;
            }

            var extension = Path.GetExtension(file.FileName);

            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.TryGetValue(extension, out var rule))
            {
                result.Errors.Add($"{file.FileName}: file type is not allowed.");
                continue;
            }

            if (file.Length > rule.MaxSizeInBytes)
            {
                result.Errors.Add(
                    $"{file.FileName}: exceeds the {rule.MaxSizeInBytes / (1024 * 1024)} MB limit for this file type.");
                continue;
            }

            var storedFileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            var absolutePath = Path.Combine(absoluteFolder, storedFileName);

            await using (var stream = new FileStream(absolutePath, FileMode.Create))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            var mediaFile = new MediaFile
            {
                FileName = storedFileName,
                OriginalFileName = Path.GetFileName(file.FileName),
                Url = $"/{UploadRootFolder}/{monthFolder}/{storedFileName}",
                FileType = rule.FileType,
                ContentType = file.ContentType,
                SizeInBytes = file.Length
            };

            _dbContext.MediaFiles.Add(mediaFile);
            result.Uploaded.Add(new MediaFileDto
            {
                Id = mediaFile.Id,
                FileName = mediaFile.FileName,
                OriginalFileName = mediaFile.OriginalFileName,
                Url = mediaFile.Url,
                FileType = mediaFile.FileType,
                ContentType = mediaFile.ContentType,
                SizeInBytes = mediaFile.SizeInBytes,
                CreatedAt = mediaFile.CreatedAt
            });
        }

        if (result.Uploaded.Count > 0)
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return result;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var mediaFile = await _dbContext.MediaFiles.FirstOrDefaultAsync(file => file.Id == id, cancellationToken);

        if (mediaFile is null)
        {
            return false;
        }

        _dbContext.MediaFiles.Remove(mediaFile);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var relativePath = mediaFile.Url.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
        var absolutePath = Path.Combine(_environment.WebRootPath, relativePath);

        try
        {
            if (File.Exists(absolutePath))
            {
                File.Delete(absolutePath);
            }
        }
        catch (IOException exception)
        {
            _logger.LogWarning(
                exception,
                "Media record {MediaFileId} was deleted but the physical file {Path} could not be removed.",
                id,
                absolutePath);
        }

        return true;
    }
}
