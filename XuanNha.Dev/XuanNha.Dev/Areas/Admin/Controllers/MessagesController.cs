using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Messages;
using XuanNha.Dev.Services.Messaging;
using XuanNha.Dev.ViewModels.Admin;

namespace XuanNha.Dev.Areas.Admin.Controllers;

[Area("Admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class MessagesController : Controller
{
    private readonly IContactMessageService _contactMessageService;

    public MessagesController(IContactMessageService contactMessageService)
    {
        _contactMessageService = contactMessageService;
    }

    public async Task<IActionResult> Index(
        [FromQuery] MessageQueryParameters query,
        CancellationToken cancellationToken)
    {
        var messages = await _contactMessageService.GetMessagesAsync(query, cancellationToken);

        return View(new MessageIndexViewModel
        {
            Query = query,
            Messages = messages
        });
    }

    public async Task<IActionResult> Details(Guid id, CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.GetByIdAsync(id, cancellationToken);

        if (message is null)
        {
            return NotFound();
        }

        if (!message.IsRead)
        {
            message = await _contactMessageService.SetReadAsync(id, true, cancellationToken) ?? message;
        }

        return View(message);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SetRead(Guid id, bool isRead, CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.SetReadAsync(id, isRead, cancellationToken);

        if (message is null)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = isRead ? "Message marked as read." : "Message marked as unread.";

        return RedirectToAction(nameof(Index));
    }

    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.GetByIdAsync(id, cancellationToken);

        if (message is null)
        {
            return NotFound();
        }

        return View(message);
    }

    [HttpPost]
    [ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _contactMessageService.DeleteAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        TempData["AdminSuccess"] = "Message deleted.";

        return RedirectToAction(nameof(Index));
    }
}
