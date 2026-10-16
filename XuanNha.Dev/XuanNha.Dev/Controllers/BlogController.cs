using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Dtos.Blogs;
using XuanNha.Dev.Enums;
using XuanNha.Dev.Services.Blogs;
using XuanNha.Dev.ViewModels;

namespace XuanNha.Dev.Controllers;

public sealed class BlogController : Controller
{
    private readonly IBlogPostService _blogPostService;

    public BlogController(IBlogPostService blogPostService)
    {
        _blogPostService = blogPostService;
    }

    [HttpGet("blog")]
    public async Task<IActionResult> Index(
        string? search,
        int pageNumber = 1,
        CancellationToken cancellationToken = default)
    {
        var query = new BlogQueryParameters
        {
            Search = search,
            Status = BlogPostStatus.Published,
            SortBy = "publishedat",
            Descending = true,
            PageNumber = pageNumber,
            PageSize = 12
        };

        var blogPosts = await _blogPostService.GetBlogPostsAsync(query, cancellationToken);

        return View(new BlogListViewModel
        {
            Search = search,
            BlogPosts = blogPosts
        });
    }

    [HttpGet("blog/{slug}")]
    public async Task<IActionResult> Details(string slug, CancellationToken cancellationToken)
    {
        var blogPost = await _blogPostService.GetBySlugAsync(slug, cancellationToken);

        if (blogPost is null || blogPost.Status != BlogPostStatus.Published)
        {
            return NotFound();
        }

        await _blogPostService.RegisterViewAsync(blogPost.Id, cancellationToken);

        return View(blogPost);
    }
}
