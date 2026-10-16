using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Dtos.Messages;
using XuanNha.Dev.Services.Messaging;

namespace XuanNha.Dev.Controllers.Api;

[ApiController]
[Route("api/contact")]
public sealed class ContactController : ControllerBase
{
    private readonly IContactMessageService _contactMessageService;

    public ContactController(IContactMessageService contactMessageService)
    {
        _contactMessageService = contactMessageService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateContactMessageRequest request,
        CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.CreateAsync(request, cancellationToken);
        return CreatedAtRoute("GetContactMessageById", new { id = message.Id }, message);
    }
}
