using XuanNha.Dev.Entities.Common;

namespace XuanNha.Dev.Entities.Messaging;

public class ContactMessage : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Subject { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public bool IsRead { get; set; }
}
