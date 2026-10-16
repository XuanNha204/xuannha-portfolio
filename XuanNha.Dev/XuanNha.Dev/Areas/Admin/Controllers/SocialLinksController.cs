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
public sealed class SocialLinksController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public SocialLinksController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var socialLinks = await _dbContext.SocialLinks
            .AsNoTracking()
            .OrderBy(link => link.DisplayOrder)
            .ThenBy(link => link.Platform)
            .ToListAsync(cancellationToken);

        return View(socialLinks);
    }

    public IActionResult Create()
    {
        return View(new SocialLinkFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(SocialLinkFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        _dbContext.SocialLinks.Add(new SocialLink
        {
            Platform = model.Platform.Trim(),
            Url = model.Url.Trim(),
            IconUrl = string.IsNullOrWhiteSpace(model.IconUrl) ? null : model.IconUrl.Trim(),
            DisplayOrder = model.DisplayOrder
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Social link created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var socialLink = await _dbContext.SocialLinks
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (socialLink is null)
        {
            return NotFound();
        }

        return View(new SocialLinkFormViewModel
        {
            Id = socialLink.Id,
            Platform = socialLink.Platform,
            Url = socialLink.Url,
            IconUrl = socialLink.IconUrl,
            DisplayOrder = socialLink.DisplayOrder
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, SocialLinkFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var socialLink = await _dbContext.SocialLinks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (socialLink is null)
        {
            return NotFound();
        }

        socialLink.Platform = model.Platform.Trim();
        socialLink.Url = model.Url.Trim();
        socialLink.IconUrl = string.IsNullOrWhiteSpace(model.IconUrl) ? null : model.IconUrl.Trim();
        socialLink.DisplayOrder = model.DisplayOrder;

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Social link updated.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var socialLink = await _dbContext.SocialLinks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (socialLink is null)
        {
            return NotFound();
        }

        _dbContext.SocialLinks.Remove(socialLink);
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Social link deleted.";

        return RedirectToAction(nameof(Index));
    }
}
