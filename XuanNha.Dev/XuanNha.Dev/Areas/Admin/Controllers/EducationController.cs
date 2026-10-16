using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Data;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class EducationController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public EducationController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var educationItems = await _dbContext.EducationItems
            .AsNoTracking()
            .OrderByDescending(education => education.StartYear)
            .ToListAsync(cancellationToken);

        return View(educationItems);
    }

    public IActionResult Create()
    {
        return View(new EducationFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(EducationFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        _dbContext.EducationItems.Add(new Entities.Profile.Education
        {
            School = model.School.Trim(),
            Major = model.Major?.Trim() ?? string.Empty,
            StartYear = model.StartYear!.Value,
            EndYear = model.EndYear,
            Description = string.IsNullOrWhiteSpace(model.Description) ? null : model.Description.Trim()
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Education entry created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var education = await _dbContext.EducationItems
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (education is null)
        {
            return NotFound();
        }

        return View(new EducationFormViewModel
        {
            Id = education.Id,
            School = education.School,
            Major = education.Major,
            StartYear = education.StartYear,
            EndYear = education.EndYear,
            Description = education.Description
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, EducationFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var education = await _dbContext.EducationItems.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (education is null)
        {
            return NotFound();
        }

        education.School = model.School.Trim();
        education.Major = model.Major?.Trim() ?? string.Empty;
        education.StartYear = model.StartYear!.Value;
        education.EndYear = model.EndYear;
        education.Description = string.IsNullOrWhiteSpace(model.Description) ? null : model.Description.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Education entry updated.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var education = await _dbContext.EducationItems.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (education is null)
        {
            return NotFound();
        }

        _dbContext.EducationItems.Remove(education);
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Education entry deleted.";

        return RedirectToAction(nameof(Index));
    }
}
