using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Services.Blogs;

namespace XuanNha.Dev.Controllers.Api;

[ApiController]
[Route("api/blogs")]
public sealed class BlogsController : ControllerBase
{
    private readonly IBlogPostService _blogPostService;

    public BlogsController(IBlogPostService blogPostService)
    {
        _blogPostService = blogPostService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBlogPosts(
        [FromQuery] BlogQueryParameters query,
        CancellationToken cancellationToken)
    {
        var result = await _blogPostService.GetBlogPostsAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetByIdAsync(id, cancellationToken);
        return blogPost is null ? NotFound() : Ok(blogPost);
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetBySlugAsync(slug, cancellationToken);
        return blogPost is null ? NotFound() : Ok(blogPost);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBlogPostRequest request,
        CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.CreateAsync(request, GetCurrentUserId(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = blogPost.Id }, blogPost);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateBlogPostRequest request,
        CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.UpdateAsync(id, request, cancellationToken);
        return blogPost is null ? NotFound() : Ok(blogPost);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> SetStatus(
        Guid id,
        [FromBody] SetBlogPostStatusRequest request,
        CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.SetStatusAsync(id, request.Status, cancellationToken);
        return blogPost is null ? NotFound() : Ok(blogPost);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _blogPostService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid? GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(userId, out var parsedUserId) ? parsedUserId : null;
    }
}
