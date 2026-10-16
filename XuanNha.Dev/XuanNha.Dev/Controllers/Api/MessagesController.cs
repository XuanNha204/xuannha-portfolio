using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Dtos.Messages;
using XuanNha.Dev.Services.Messaging;

namespace XuanNha.Dev.Controllers.Api;

[ApiController]
[Route("api/messages")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class MessagesController : ControllerBase
{
    private readonly IContactMessageService _contactMessageService;

    public MessagesController(IContactMessageService contactMessageService)
    {
        _contactMessageService = contactMessageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages(
        [FromQuery] MessageQueryParameters query,
        CancellationToken cancellationToken)
    {
        var result = await _contactMessageService.GetMessagesAsync(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}", Name = "GetContactMessageById")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.GetByIdAsync(id, cancellationToken);
        return message is null ? NotFound() : Ok(message);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        var message = await _contactMessageService.SetReadAsync(id, true, cancellationToken);
        return message is null ? NotFound() : Ok(message);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _contactMessageService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
