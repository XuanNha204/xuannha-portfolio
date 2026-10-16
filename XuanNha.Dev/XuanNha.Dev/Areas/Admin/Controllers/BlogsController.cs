using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Enums;
using Microsoft.AspNetCore.Mvc.Rendering;
using XuanNha.Dev.Services.Blogs;
using XuanNha.Dev.Services.Taxonomy;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class BlogsController : Controller
{
    private readonly IBlogPostService _blogPostService;
    private readonly ICategoryService _categoryService;

    public BlogsController(IBlogPostService blogPostService, ICategoryService categoryService)
    {
        _blogPostService = blogPostService;
        _categoryService = categoryService;
    }

    public async Task<IActionResult> Index(
        [FromQuery] BlogQueryParameters query,
        CancellationToken cancellationToken)
    {
        query.PageSize = query.PageSize <= 0 ? 12 : query.PageSize;

        var blogPosts = await _blogPostService.GetBlogPostsAsync(query, cancellationToken);

        return View(new BlogIndexViewModel
        {
            Query = query,
            BlogPosts = blogPosts
        });
    }

    public async Task<IActionResult> Details(Guid id, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetByIdAsync(id, cancellationToken);

        if (blogPost is null)
        {
            return NotFound();
        }

        return View(blogPost);
    }

    public async Task<IActionResult> Create(CancellationToken cancellationToken)
    {
        await LoadCategoryOptionsAsync(null, cancellationToken);
        return View(new BlogFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(BlogFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            await LoadCategoryOptionsAsync(model.CategoryId, cancellationToken);
            return View(model);
        }

        var authorId = GetCurrentUserId();
        var blogPost = await _blogPostService.CreateAsync(ToCreateRequest(model), authorId, cancellationToken);
        TempData["AdminSuccess"] = "Blog post created.";

        return RedirectToAction(nameof(Details), new { id = blogPost.Id });
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetByIdAsync(id, cancellationToken);

        if (blogPost is null)
        {
            return NotFound();
        }

        await LoadCategoryOptionsAsync(blogPost.CategoryId, cancellationToken);

        return View(ToFormViewModel(blogPost));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, BlogFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            await LoadCategoryOptionsAsync(model.CategoryId, cancellationToken);
            return View(model);
        }

        var blogPost = await _blogPostService.UpdateAsync(id, ToUpdateRequest(model), cancellationToken);

        if (blogPost is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Blog post updated.";

        return RedirectToAction(nameof(Details), new { id = blogPost.Id });
    }

    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetByIdAsync(id, cancellationToken);

        if (blogPost is null)
        {
            return NotFound();
        }

        return View(blogPost);
    }

    [HttpPost]
    [ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _blogPostService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Blog post deleted.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SetStatus(Guid id, BlogPostStatus status, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.SetStatusAsync(id, status, cancellationToken);

        if (blogPost is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = $"Blog post status changed to {status}.";

        return RedirectToAction(nameof(Index));
    }

    private async Task LoadCategoryOptionsAsync(Guid? selectedCategoryId, CancellationToken cancellationToken)
    {
        var categories = await _categoryService.GetAllAsync(cancellationToken);
        ViewBag.CategoryOptions = new SelectList(categories, "Id", "Name", selectedCategoryId);
    }

    private Guid? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }

    private static CreateBlogPostRequest ToCreateRequest(BlogFormViewModel model)
    {
        return new CreateBlogPostRequest
        {
            Title = model.Title,
            Slug = model.Slug,
            Summary = model.Summary,
            ContentMarkdown = model.ContentMarkdown,
            CoverImageUrl = model.CoverImageUrl,
            CategoryId = model.CategoryId,
            Status = model.Status,
            PublishedAt = model.PublishedAt
        };
    }

    private static UpdateBlogPostRequest ToUpdateRequest(BlogFormViewModel model)
    {
        return new UpdateBlogPostRequest
        {
            Title = model.Title,
            Slug = model.Slug,
            Summary = model.Summary,
            ContentMarkdown = model.ContentMarkdown,
            CoverImageUrl = model.CoverImageUrl,
            CategoryId = model.CategoryId,
            Status = model.Status,
            PublishedAt = model.PublishedAt
        };
    }

    private static BlogFormViewModel ToFormViewModel(BlogDetailDto blogPost)
    {
        return new BlogFormViewModel
        {
            Id = blogPost.Id,
            Title = blogPost.Title,
            Slug = blogPost.Slug,
            Summary = blogPost.Summary,
            ContentMarkdown = blogPost.ContentMarkdown,
            CoverImageUrl = blogPost.CoverImageUrl,
            CategoryId = blogPost.CategoryId,
            Status = blogPost.Status,
            PublishedAt = blogPost.PublishedAt
        };
    }
}
