using XuanNha.Dev.ViewModels;

namespace XuanNha.Dev.Services.Profiles;

public interface IAboutService
{
    Task<AboutViewModel> GetAboutAsync(CancellationToken cancellationToken);
}
