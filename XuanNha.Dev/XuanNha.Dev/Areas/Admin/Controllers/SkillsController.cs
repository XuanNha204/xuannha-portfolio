using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Data;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class SkillsController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public SkillsController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var skills = await _dbContext.Skills
            .AsNoTracking()
            .OrderBy(skill => skill.GroupName)
            .ThenBy(skill => skill.SortOrder)
            .ThenBy(skill => skill.Name)
            .ToListAsync(cancellationToken);

        return View(skills);
    }

    public IActionResult Create()
    {
        return View(new SkillFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(SkillFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        _dbContext.Skills.Add(new Skill
        {
            Name = model.Name.Trim(),
            GroupName = model.GroupName?.Trim() ?? string.Empty,
            Level = model.Level,
            IconUrl = string.IsNullOrWhiteSpace(model.IconUrl) ? null : model.IconUrl.Trim(),
            SortOrder = model.SortOrder
        });
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Skill created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var skill = await _dbContext.Skills.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (skill is null)
        {
            return NotFound();
        }

        return View(new SkillFormViewModel
        {
            Id = skill.Id,
            Name = skill.Name,
            GroupName = skill.GroupName,
            Level = skill.Level,
            IconUrl = skill.IconUrl,
            SortOrder = skill.SortOrder
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, SkillFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var skill = await _dbContext.Skills.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (skill is null)
        {
            return NotFound();
        }

        skill.Name = model.Name.Trim();
        skill.GroupName = model.GroupName?.Trim() ?? string.Empty;
        skill.Level = model.Level;
        skill.IconUrl = string.IsNullOrWhiteSpace(model.IconUrl) ? null : model.IconUrl.Trim();
        skill.SortOrder = model.SortOrder;

        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Skill updated.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var skill = await _dbContext.Skills.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (skill is null)
        {
            return NotFound();
        }

        _dbContext.Skills.Remove(skill);
        await _dbContext.SaveChangesAsync(cancellationToken);
        TempData["AdminSuccess"] = "Skill deleted.";

        return RedirectToAction(nameof(Index));
    }
}
