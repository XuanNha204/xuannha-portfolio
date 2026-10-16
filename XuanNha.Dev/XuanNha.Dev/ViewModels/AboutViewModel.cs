using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Entities.Profile;

namespace XuanNha.Dev.ViewModels;

public sealed class AboutViewModel
{
    public ProfileInfo? Profile { get; set; }

    public IReadOnlyCollection<IGrouping<string, Skill>> SkillGroups { get; set; } =
        Array.Empty<IGrouping<string, Skill>>();

    public IReadOnlyCollection<Experience> Experiences { get; set; } = Array.Empty<Experience>();

    public IReadOnlyCollection<Education> EducationItems { get; set; } = Array.Empty<Education>();

    public IReadOnlyCollection<Certificate> Certificates { get; set; } = Array.Empty<Certificate>();

    public IReadOnlyCollection<SocialLink> SocialLinks { get; set; } = Array.Empty<SocialLink>();

    public bool IsEmpty =>
        Profile is null
        && SkillGroups.Count == 0
        && Experiences.Count == 0
        && EducationItems.Count == 0
        && Certificates.Count == 0
        && SocialLinks.Count == 0;
}
