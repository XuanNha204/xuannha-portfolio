using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using XuanNha.Dev.Constants;
using XuanNha.Dev.Entities.Identity;
using XuanNha.Dev.Options;

namespace XuanNha.Dev.Data;

public sealed class DatabaseSeeder
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly AdminSeedOptions _adminSeedOptions;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        IOptions<AdminSeedOptions> adminSeedOptions,
        ILogger<DatabaseSeeder> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _adminSeedOptions = adminSeedOptions.Value;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await EnsureAdminRoleAsync();
        await EnsureAdminUserAsync();
    }

    private async Task EnsureAdminRoleAsync()
    {
        if (await _roleManager.RoleExistsAsync(AppRoles.Admin))
        {
            return;
        }

        var result = await _roleManager.CreateAsync(new ApplicationRole
        {
            Name = AppRoles.Admin,
            Description = "Full access to the XuanNha.Dev CMS."
        });

        ThrowIfFailed(result, "create Admin role");
    }

    private async Task EnsureAdminUserAsync()
    {
        if (string.IsNullOrWhiteSpace(_adminSeedOptions.Email) ||
            string.IsNullOrWhiteSpace(_adminSeedOptions.Password))
        {
            _logger.LogWarning("Admin seed skipped because email or password is missing.");
            return;
        }

        var normalizedEmail = _adminSeedOptions.Email.Trim();
        var user = await _userManager.FindByEmailAsync(normalizedEmail);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = normalizedEmail,
                Email = normalizedEmail,
                EmailConfirmed = true,
                FullName = string.IsNullOrWhiteSpace(_adminSeedOptions.FullName)
                    ? "Site Administrator"
                    : _adminSeedOptions.FullName.Trim()
            };

            var createResult = await _userManager.CreateAsync(user, _adminSeedOptions.Password);
            ThrowIfFailed(createResult, "create Admin user");
        }

        if (!await _userManager.IsInRoleAsync(user, AppRoles.Admin))
        {
            var addRoleResult = await _userManager.AddToRoleAsync(user, AppRoles.Admin);
            ThrowIfFailed(addRoleResult, "assign Admin role");
        }
    }

    private static void ThrowIfFailed(IdentityResult result, string action)
    {
        if (result.Succeeded)
        {
            return;
        }

        var errors = string.Join("; ", result.Errors.Select(error => $"{error.Code}: {error.Description}"));
        throw new InvalidOperationException($"Failed to {action}. {errors}");
    }
}
