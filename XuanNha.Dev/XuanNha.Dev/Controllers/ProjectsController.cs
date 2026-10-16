using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Dtos.Projects;
using XuanNha.Dev.Enums;
using XuanNha.Dev.Services.Projects;
using XuanNha.Dev.ViewModels;

namespace XuanNha.Dev.Controllers;

public sealed class ProjectsController : Controller
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet("projects")]
    public async Task<IActionResult> Index(
        string? search,
        int pageNumber = 1,
        CancellationToken cancellationToken = default)
    {
        var query = new ProjectQueryParameters
        {
            Search = search,
            Status = ProjectStatus.Published,
            SortBy = "publishedat",
            Descending = true,
            PageNumber = pageNumber,
            PageSize = 12
        };

        var projects = await _projectService.GetProjectsAsync(query, cancellationToken);

        return View(new ProjectListViewModel
        {
            Search = search,
            Projects = projects
        });
    }

    [HttpGet("projects/{slug}")]
    public async Task<IActionResult> Details(string slug, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetBySlugAsync(slug, cancellationToken);

        if (project is null || project.Status != ProjectStatus.Published)
        {
            return NotFound();
        }

        return View(project);
    }
}
