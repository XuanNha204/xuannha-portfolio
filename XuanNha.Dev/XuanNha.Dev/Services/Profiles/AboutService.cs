using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Data;
using XuanNha.Dev.ViewModels;

namespace XuanNha.Dev.Services.Profiles;

public sealed class AboutService : IAboutService
{
    private readonly ApplicationDbContext _dbContext;

    public AboutService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AboutViewModel> GetAboutAsync(CancellationToken cancellationToken)
    {
        var profile = await _dbContext.Profiles
            .AsNoTracking()
            .OrderBy(item => item.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var skills = await _dbContext.Skills
            .AsNoTracking()
            .OrderBy(skill => skill.GroupName)
            .ThenBy(skill => skill.SortOrder)
            .ThenBy(skill => skill.Name)
            .ToListAsync(cancellationToken);

        var experiences = await _dbContext.Experiences
            .AsNoTracking()
            .OrderByDescending(experience => experience.StartDate)
            .ToListAsync(cancellationToken);

        var educationItems = await _dbContext.EducationItems
            .AsNoTracking()
            .OrderByDescending(education => education.StartYear)
            .ToListAsync(cancellationToken);

        var certificates = await _dbContext.Certificates
            .AsNoTracking()
            .OrderByDescending(certificate => certificate.IssuedAt)
            .ToListAsync(cancellationToken);

        var socialLinks = await _dbContext.SocialLinks
            .AsNoTracking()
            .OrderBy(link => link.DisplayOrder)
            .ThenBy(link => link.Platform)
            .ToListAsync(cancellationToken);

        return new AboutViewModel
        {
            Profile = profile,
            SkillGroups = skills.GroupBy(skill => skill.GroupName).ToList(),
            Experiences = experiences,
            EducationItems = educationItems,
            Certificates = certificates,
            SocialLinks = socialLinks
        };
    }
}
