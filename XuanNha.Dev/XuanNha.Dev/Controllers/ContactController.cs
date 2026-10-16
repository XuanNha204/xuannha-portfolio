using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using XuanNha.Dev.Dtos.Messages;
using XuanNha.Dev.Services.Messaging;
using XuanNha.Dev.ViewModels;

namespace XuanNha.Dev.Controllers;

public sealed class ContactController : Controller
{
    private readonly IContactMessageService _contactMessageService;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public ContactController(
        IContactMessageService contactMessageService,
        IStringLocalizer<SharedResource> localizer)
    {
        _contactMessageService = contactMessageService;
        _localizer = localizer;
    }

    [HttpGet("contact")]
    public IActionResult Index()
    {
        return View(new ContactFormViewModel());
    }

    [HttpPost("contact")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(ContactFormViewModel model, CancellationToken cancellationToken)
    {
        if (!string.IsNullOrEmpty(model.Website))
        {
            // Honeypot filled in: pretend success without storing anything.
            TempData["ContactSuccess"] = _localizer["Thanks for reaching out! I will get back to you soon."].Value;
            return RedirectToAction(nameof(Index));
        }

        if (!ModelState.IsValid)
        {
            return View(model);
        }

        await _contactMessageService.CreateAsync(
            new CreateContactMessageRequest
            {
                FullName = model.FullName,
                Email = model.Email,
                Subject = model.Subject,
                Content = model.Content
            },
            cancellationToken);

        TempData["ContactSuccess"] = _localizer["Thanks for reaching out! I will get back to you soon."].Value;

        return RedirectToAction(nameof(Index));
    }
}
