using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Services.Profiles;

namespace XuanNha.Dev.Controllers;

public sealed class AboutController : Controller
{
    private readonly IAboutService _aboutService;

    public AboutController(IAboutService aboutService)
    {
        _aboutService = aboutService;
    }

    [HttpGet("about")]
    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var about = await _aboutService.GetAboutAsync(cancellationToken);
        return View(about);
    }
}
