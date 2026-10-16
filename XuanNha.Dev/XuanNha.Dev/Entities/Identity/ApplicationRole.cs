using Microsoft.AspNetCore.Identity;

namespace XuanNha.Dev.Entities.Identity;

public class ApplicationRole : IdentityRole<Guid>
{
    public string? Description { get; set; }
}
