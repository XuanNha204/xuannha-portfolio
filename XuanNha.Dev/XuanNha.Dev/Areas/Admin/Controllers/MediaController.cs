using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Media;
using XuanNha.Dev.Services.Media;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class MediaController : Controller
{
    private const long MaxUploadRequestBytes = 210 * 1024 * 1024;

    private readonly IMediaService _mediaService;

    public MediaController(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<IActionResult> Index(
        [FromQuery] MediaQueryParameters? query,
        CancellationToken cancellationToken)
    {
        query ??= new MediaQueryParameters();
        var mediaFiles = await _mediaService.GetMediaFilesAsync(query, cancellationToken);

        return View(new MediaIndexViewModel
        {
            Query = query,
            MediaFiles = mediaFiles
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    [RequestSizeLimit(MaxUploadRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxUploadRequestBytes)]
    public async Task<IActionResult> Upload(List<IFormFile> files, CancellationToken cancellationToken)
    {
        var result = await _mediaService.UploadAsync(files, cancellationToken);

        if (result.Uploaded.Count > 0)
        {
            TempData["AdminSuccess"] = $"{result.Uploaded.Count} file(s) uploaded.";
        }

        if (result.Errors.Count > 0)
        {
            TempData["AdminError"] = string.Join(" ", result.Errors);
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _mediaService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Media file deleted.";

        return RedirectToAction(nameof(Index));
    }
}
