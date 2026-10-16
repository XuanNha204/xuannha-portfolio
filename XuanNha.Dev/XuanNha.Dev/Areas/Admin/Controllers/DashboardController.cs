using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Data;
using XuanNha.Dev.Enums;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class DashboardController : Controller
{
    private readonly ApplicationDbContext _dbContext;

    public DashboardController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Index(CancellationToken cancellationToken)
    {
        var viewModel = new DashboardViewModel
        {
            ProjectCount = await _dbContext.Projects.CountAsync(cancellationToken),
            PublishedProjectCount = await _dbContext.Projects
                .CountAsync(project => project.Status == ProjectStatus.Published, cancellationToken),
            BlogPostCount = await _dbContext.BlogPosts.CountAsync(cancellationToken),
            ContactMessageCount = await _dbContext.ContactMessages.CountAsync(cancellationToken),
            UnreadContactMessageCount = await _dbContext.ContactMessages
                .CountAsync(message => !message.IsRead, cancellationToken),
            MediaFileCount = await _dbContext.MediaFiles.CountAsync(cancellationToken),
            SkillCount = await _dbContext.Skills.CountAsync(cancellationToken)
        };

        return View(viewModel);
    }
}
