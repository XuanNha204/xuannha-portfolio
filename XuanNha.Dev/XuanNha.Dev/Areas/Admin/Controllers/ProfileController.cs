using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Data;
using XuanNha.Dev.Entities.Profile;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class ProfileController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public ProfileController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Edit(CancellationToken cancellationToken)
    {
        var profile = await GetProfileAsync(cancellationToken);

        return View(new ProfileFormViewModel
        {
            Headline = profile?.Headline,
            AboutMe = profile?.AboutMe,
            AvatarUrl = profile?.AvatarUrl,
            ResumeUrl = profile?.ResumeUrl,
            Location = profile?.Location
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(ProfileFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var profile = await GetProfileAsync(cancellationToken);

        if (profile is null)
        {
            profile = new ProfileInfo();
            _dbContext.Profiles.Add(profile);
        }

        profile.Headline = model.Headline?.Trim() ?? string.Empty;
        profile.AboutMe = model.AboutMe?.Trim() ?? string.Empty;
        profile.AvatarUrl = NormalizeOptionalValue(model.AvatarUrl);
        profile.ResumeUrl = NormalizeOptionalValue(model.ResumeUrl);
        profile.Location = NormalizeOptionalValue(model.Location);

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Profile saved.";

        return RedirectToAction(nameof(Edit));
    }

    private Task<ProfileInfo?> GetProfileAsync(CancellationToken cancellationToken)
    {
        return _dbContext.Profiles
            .OrderBy(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static string? NormalizeOptionalValue(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
