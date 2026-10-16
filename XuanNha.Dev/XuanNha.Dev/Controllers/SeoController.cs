using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Enums;

namespace XuanNha.Dev.Controllers;

public sealed class SeoController : Controller
{
    private static readonly XNamespace SitemapNamespace = "http://www.sitemaps.org/schemas/sitemap/0.9";

    private readonly ApplicationDbContext _dbContext;

    public SeoController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("sitemap.xml")]
    [ResponseCache(Duration = 3600)]
    public async Task<IActionResult> Sitemap(CancellationToken cancellationToken)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";

        var urls = new List<XElement>
        {
            CreateUrlElement($"{baseUrl}/", null),
            CreateUrlElement($"{baseUrl}/projects", null),
            CreateUrlElement($"{baseUrl}/blog", null),
            CreateUrlElement($"{baseUrl}/about", null),
            CreateUrlElement($"{baseUrl}/contact", null)
        };

        var projects = await _dbContext.Projects
            .AsNoTracking()
            .Where(project => project.Status == ProjectStatus.Published)
            .Select(project => new { project.Slug, project.UpdatedAt, project.PublishedAt })
            .ToListAsync(cancellationToken);

        urls.AddRange(projects.Select(project =>
            CreateUrlElement($"{baseUrl}/projects/{project.Slug}", project.UpdatedAt ?? project.PublishedAt)));

        var blogPosts = await _dbContext.BlogPosts
            .AsNoTracking()
            .Where(post => post.Status == BlogPostStatus.Published)
            .Select(post => new { post.Slug, post.UpdatedAt, post.PublishedAt })
            .ToListAsync(cancellationToken);

        urls.AddRange(blogPosts.Select(post =>
            CreateUrlElement($"{baseUrl}/blog/{post.Slug}", post.UpdatedAt ?? post.PublishedAt)));

        var document = new XDocument(
            new XDeclaration("1.0", "utf-8", null),
            new XElement(SitemapNamespace + "urlset", urls));

        return Content(document.Declaration + Environment.NewLine + document, "application/xml", Encoding.UTF8);
    }

    private static XElement CreateUrlElement(string location, DateTimeOffset? lastModified)
    {
        var element = new XElement(SitemapNamespace + "url", new XElement(SitemapNamespace + "loc", location));

        if (lastModified.HasValue)
        {
            element.Add(new XElement(SitemapNamespace + "lastmod", lastModified.Value.ToString("yyyy-MM-dd")));
        }

        return element;
    }
}
