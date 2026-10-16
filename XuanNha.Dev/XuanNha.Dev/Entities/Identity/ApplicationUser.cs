using Microsoft.AspNetCore.Identity;
using XuanNha.Dev.Entities.Content;

namespace XuanNha.Dev.Entities.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public DateTimeOffset? UpdatedAt { get; set; }

    public ICollection<BlogPost> BlogPosts { get; set; } = new List<BlogPost>();
}
