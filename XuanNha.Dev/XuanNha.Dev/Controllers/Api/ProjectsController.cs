using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Projects;
using XuanNha.Dev.Services.Projects;

namespace XuanNha.Dev.Controllers.Api;

[ApiController]
[Route("api/projects")]
public sealed class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProjects(
        [FromQuery] ProjectQueryParameters query,
        CancellationToken cancellationToken)
    {
        var result = await _projectService.GetProjectsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetByIdAsync(id, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var project = await _projectService.GetBySlugAsync(slug, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var project = await _projectService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateProjectRequest request,
        CancellationToken cancellationToken)
    {
        var project = await _projectService.UpdateAsync(id, request, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPatch("{id:guid}/feature")]
    public async Task<IActionResult> SetFeatured(
        Guid id,
        [FromBody] SetProjectFeaturedRequest request,
        CancellationToken cancellationToken)
    {
        var project = await _projectService.SetFeaturedAsync(id, request.Featured, cancellationToken);
        return project is null ? NotFound() : Ok(project);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _projectService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
