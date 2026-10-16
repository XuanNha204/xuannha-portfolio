using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Messages;

namespace XuanNha.Dev.ViewModels.Admin;

public sealed class MessageIndexViewModel
{
    public MessageQueryParameters Query { get; set; } = new();

    public PagedResult<ContactMessageDto> Messages { get; set; } =
        new(Array.Empty<ContactMessageDto>(), 1, 20, 0);
}
