using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Taxonomy;
using XuanNha.Dev.Services.Taxonomy;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class TagsController : Controller
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var tags = await _tagService.GetAllAsync(cancellationToken);
        return View(tags);
    }

    public IActionResult Create()
    {
        return View(new TagFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(TagFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        await _tagService.CreateAsync(ToRequest(model), cancellationToken);
        TempData["AdminSuccess"] = "Tag created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var tag = await _tagService.GetByIdAsync(id, cancellationToken);

        if (tag is null)
        {
            return NotFound();
        }

        return View(new TagFormViewModel
        {
            Id = tag.Id,
            Name = tag.Name,
            Slug = tag.Slug
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, TagFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var tag = await _tagService.UpdateAsync(id, ToRequest(model), cancellationToken);

        if (tag is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Tag updated.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var tag = await _tagService.GetByIdAsync(id, cancellationToken);

        if (tag is null)
        {
            return NotFound();
        }

        return View(tag);
    }

    [HttpPost]
    [ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _tagService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Tag deleted.";

        return RedirectToAction(nameof(Index));
    }

    private static SaveTagRequest ToRequest(TagFormViewModel model)
    {
        return new SaveTagRequest
        {
            Name = model.Name,
            Slug = model.Slug
        };
    }
}
