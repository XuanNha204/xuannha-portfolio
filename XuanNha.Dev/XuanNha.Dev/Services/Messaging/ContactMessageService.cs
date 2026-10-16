using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.Dtos.Common;
using XuanNha.Dev.Dtos.Messages;
using XuanNha.Dev.Entities.Messaging;

namespace XuanNha.Dev.Services.Messaging;

public sealed class ContactMessageService : IContactMessageService
{
    private readonly ApplicationDbContext _dbContext;

    public ContactMessageService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<ContactMessageDto>> GetMessagesAsync(
        MessageQueryParameters query,
        CancellationToken cancellationToken)
    {
        var messages = _dbContext.ContactMessages.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = query.Search.Trim();
            messages = messages.Where(message =>
                message.FullName.Contains(searchTerm) ||
                message.Email.Contains(searchTerm) ||
                message.Subject.Contains(searchTerm) ||
                message.Content.Contains(searchTerm));
        }

        if (query.IsRead.HasValue)
        {
            messages = messages.Where(message => message.IsRead == query.IsRead.Value);
        }

        messages = messages.OrderByDescending(message => message.CreatedAt);

        var totalItems = await messages.CountAsync(cancellationToken);
        var items = await messages
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(message => new ContactMessageDto
            {
                Id = message.Id,
                FullName = message.FullName,
                Email = message.Email,
                Subject = message.Subject,
                Content = message.Content,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ContactMessageDto>(items, query.PageNumber, query.PageSize, totalItems);
    }

    public async Task<ContactMessageDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var message = await _dbContext.ContactMessages
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        return message is null ? null : Map(message);
    }

    public async Task<ContactMessageDto> CreateAsync(
        CreateContactMessageRequest request,
        CancellationToken cancellationToken)
    {
        var message = new ContactMessage
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            Subject = request.Subject.Trim(),
            Content = request.Content.Trim()
        };

        _dbContext.ContactMessages.Add(message);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(message);
    }

    public async Task<ContactMessageDto?> SetReadAsync(Guid id, bool isRead, CancellationToken cancellationToken)
    {
        var message = await _dbContext.ContactMessages.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (message is null)
        {
            return null;
        }

        message.IsRead = isRead;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Map(message);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var message = await _dbContext.ContactMessages.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);

        if (message is null)
        {
            return false;
        }

        _dbContext.ContactMessages.Remove(message);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public Task<int> CountUnreadAsync(CancellationToken cancellationToken)
    {
        return _dbContext.ContactMessages.CountAsync(message => !message.IsRead, cancellationToken);
    }

    private static ContactMessageDto Map(ContactMessage message)
    {
        return new ContactMessageDto
        {
            Id = message.Id,
            FullName = message.FullName,
            Email = message.Email,
            Subject = message.Subject,
            Content = message.Content,
            IsRead = message.IsRead,
            CreatedAt = message.CreatedAt
        };
    }
}
