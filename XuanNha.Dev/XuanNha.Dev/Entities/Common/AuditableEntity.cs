namespace XuanNha.Dev.Entities.Common;

public abstract class AuditableEntity
{
    public Guid Id { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }
}
