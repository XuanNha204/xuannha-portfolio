using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;

namespace XuanNha.Dev.Controllers;

public sealed class LanguageController : Controller
{
    private static readonly string[] SupportedCultures = ["en", "vi", "zh"];

    [HttpPost("language/set")]
    [ValidateAntiForgeryToken]
    public IActionResult SetLanguage(string culture, string? returnUrl)
    {
        if (!SupportedCultures.Contains(culture))
        {
            culture = "en";
        }

        Response.Cookies.Append(
            CookieRequestCultureProvider.DefaultCookieName,
            CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
            new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddYears(1),
                IsEssential = true,
                SameSite = SameSiteMode.Lax
            });

        return LocalRedirect(string.IsNullOrEmpty(returnUrl) ? "/" : returnUrl);
    }
}
