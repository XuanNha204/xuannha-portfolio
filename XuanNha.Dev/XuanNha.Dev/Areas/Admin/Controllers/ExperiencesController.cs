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
public sealed class ExperiencesController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public ExperiencesController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var experiences = await _dbContext.Experiences
            .AsNoTracking()
            .OrderByDescending(experience => experience.StartDate)
            .ToListAsync(cancellationToken);

        return View(experiences);
    }

    public IActionResult Create()
    {
        return View(new ExperienceFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ExperienceFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        _dbContext.Experiences.Add(new Experience
        {
            Company = model.Company.Trim(),
            Position = model.Position.Trim(),
            StartDate = model.StartDate!.Value,
            EndDate = model.EndDate,
            Description = model.Description?.Trim() ?? string.Empty
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Experience created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var experience = await _dbContext.Experiences
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (experience is null)
        {
            return NotFound();
        }

        return View(new ExperienceFormViewModel
        {
            Id = experience.Id,
            Company = experience.Company,
            Position = experience.Position,
            StartDate = experience.StartDate,
            EndDate = experience.EndDate,
            Description = experience.Description
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, ExperienceFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var experience = await _dbContext.Experiences.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (experience is null)
        {
            return NotFound();
        }

        experience.Company = model.Company.Trim();
        experience.Position = model.Position.Trim();
        experience.StartDate = model.StartDate!.Value;
        experience.EndDate = model.EndDate;
        experience.Description = model.Description?.Trim() ?? string.Empty;

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Experience updated.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var experience = await _dbContext.Experiences.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (experience is null)
        {
            return NotFound();
        }

        _dbContext.Experiences.Remove(experience);
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Experience deleted.";

        return RedirectToAction(nameof(Index));
    }
}
