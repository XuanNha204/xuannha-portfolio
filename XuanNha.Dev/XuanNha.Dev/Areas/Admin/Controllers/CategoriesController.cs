using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Taxonomy;
using XuanNha.Dev.Services.Taxonomy;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class CategoriesController : Controller
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllAsync(cancellationToken);
        return View(categories);
    }

    public IActionResult Create()
    {
        return View(new CategoryFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(CategoryFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        await _categoryService.CreateAsync(ToRequest(model), cancellationToken);
        TempData["AdminSuccess"] = "Category created.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(id, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        return View(new CategoryFormViewModel
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            Description = category.Description
        });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, CategoryFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var category = await _categoryService.UpdateAsync(id, ToRequest(model), cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Category updated.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var category = await _categoryService.GetByIdAsync(id, cancellationToken);

        if (category is null)
        {
            return NotFound();
        }

        return View(category);
    }

    [HttpPost]
    [ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _categoryService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Category deleted.";

        return RedirectToAction(nameof(Index));
    }

    private static SaveCategoryRequest ToRequest(CategoryFormViewModel model)
    {
        return new SaveCategoryRequest
        {
            Name = model.Name,
            Slug = model.Slug,
            Description = model.Description
        };
    }
}
