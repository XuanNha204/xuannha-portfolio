using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Messages;

namespace XuanNha.Dev.Services.Messaging;

public interface IContactMessageService
{
    Task<PagedResult<ContactMessageDto>> GetMessagesAsync(MessageQueryParameters query, CancellationToken cancellationToken);

    Task<ContactMessageDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<ContactMessageDto> CreateAsync(CreateContactMessageRequest request, CancellationToken cancellationToken);

    Task<ContactMessageDto?> SetReadAsync(Guid id, bool isRead, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task<int> CountUnreadAsync(CancellationToken cancellationToken);
}
