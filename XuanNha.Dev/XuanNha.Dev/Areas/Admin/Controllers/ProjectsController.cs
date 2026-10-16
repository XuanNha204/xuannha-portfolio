using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Projects;
using XuanNha.Dev.Services.Projects;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class ProjectsController : Controller
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    public async Task<IActionResult> Index(
        [FromQuery] ProjectQueryParameters query,
        CancellationToken cancellationToken)
    {
        query.PageSize = query.PageSize <= 0 ? 12 : query.PageSize;

        var projects = await _projectService.GetProjectsAsync(query, cancellationToken);

        return View(new ProjectIndexViewModel
        {
            Query = query,
            Projects = projects
        });
    }

    public async Task<IActionResult> Details(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return NotFound();
        }

        return View(project);
    }

    public IActionResult Create()
    {
        return View(new ProjectFormViewModel());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(ProjectFormViewModel model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var project = await _projectService.CreateAsync(ToCreateRequest(model), cancellationToken);
        TempData["AdminSuccess"] = "Project created.";

        return RedirectToAction(nameof(Details), new { id = project.Id });
    }

    public async Task<IActionResult> Edit(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return NotFound();
        }

        return View(ToFormViewModel(project));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(Guid id, ProjectFormViewModel model, CancellationToken cancellationToken)
    {
        if (id != model.Id)
        {
            return BadRequest();
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        var project = await _projectService.UpdateAsync(id, ToUpdateRequest(model), cancellationToken);

        if (project is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Project updated.";

        return RedirectToAction(nameof(Details), new { id = project.Id });
    }

    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetByIdAsync(id, cancellationToken);

        if (project is null)
        {
            return NotFound();
        }

        return View(project);
    }

    [HttpPost]
    [ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _projectService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Project deleted.";

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ToggleFeatured(Guid id, bool featured, CancellationToken cancellationToken)
    {
        var project = await _projectService.SetFeaturedAsync(id, featured, cancellationToken);

        if (project is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = featured ? "Project marked as featured." : "Project removed from featured.";

        return RedirectToAction(nameof(Index));
    }

    private static CreateProjectRequest ToCreateRequest(ProjectFormViewModel model)
    {
        return new CreateProjectRequest
        {
            Title = model.Title,
            Slug = model.Slug,
            Summary = model.Summary,
            Description = model.Description,
            ThumbnailUrl = model.ThumbnailUrl,
            GithubUrl = model.GithubUrl,
            DemoUrl = model.DemoUrl,
            VideoUrl = model.VideoUrl,
            TechnologyStack = model.TechnologyStack,
            Role = model.Role,
            Challenges = model.Challenges,
            Solutions = model.Solutions,
            Results = model.Results,
            Status = model.Status,
            Featured = model.Featured,
            PublishedAt = model.PublishedAt,
            Images = ParseGallery(model.GalleryImagesText)
        };
    }

    private static UpdateProjectRequest ToUpdateRequest(ProjectFormViewModel model)
    {
        return new UpdateProjectRequest
        {
            Title = model.Title,
            Slug = model.Slug,
            Summary = model.Summary,
            Description = model.Description,
            ThumbnailUrl = model.ThumbnailUrl,
            GithubUrl = model.GithubUrl,
            DemoUrl = model.DemoUrl,
            VideoUrl = model.VideoUrl,
            TechnologyStack = model.TechnologyStack,
            Role = model.Role,
            Challenges = model.Challenges,
            Solutions = model.Solutions,
            Results = model.Results,
            Status = model.Status,
            Featured = model.Featured,
            PublishedAt = model.PublishedAt,
            Images = ParseGallery(model.GalleryImagesText)
        };
    }

    private static ProjectFormViewModel ToFormViewModel(ProjectDetailDto project)
    {
        return new ProjectFormViewModel
        {
            Id = project.Id,
            Title = project.Title,
            Slug = project.Slug,
            Summary = project.Summary,
            Description = project.Description,
            ThumbnailUrl = project.ThumbnailUrl,
            GithubUrl = project.GithubUrl,
            DemoUrl = project.DemoUrl,
            VideoUrl = project.VideoUrl,
            TechnologyStack = project.TechnologyStack,
            Role = project.Role,
            Challenges = project.Challenges,
            Solutions = project.Solutions,
            Results = project.Results,
            Status = project.Status,
            Featured = project.Featured,
            PublishedAt = project.PublishedAt,
            GalleryImagesText = string.Join(Environment.NewLine, project.Images.Select(image => image.ImageUrl))
        };
    }

    private static IReadOnlyCollection<ProjectImageRequest> ParseGallery(string? galleryImagesText)
    {
        if (string.IsNullOrWhiteSpace(galleryImagesText))
        {
            return Array.Empty<ProjectImageRequest>();
        }

        return galleryImagesText
            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select((imageUrl, index) => new ProjectImageRequest
            {
                ImageUrl = imageUrl,
                SortOrder = index + 1
            })
            .ToList();
    }
}
