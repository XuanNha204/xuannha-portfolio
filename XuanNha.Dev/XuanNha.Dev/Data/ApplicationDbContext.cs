using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using XuanNha.Dev.Entities.Common;
using XuanNha.Dev.Entities.Content;
using XuanNha.Dev.Entities.Identity;
using XuanNha.Dev.Entities.Media;
using XuanNha.Dev.Entities.Messaging;
using XuanNha.Dev.Entities.Profile;

namespace XuanNha.Dev.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Project> Projects => Set<Project>();

    public DbSet<ProjectImage> ProjectImages => Set<ProjectImage>();

    public DbSet<ProjectTag> ProjectTags => Set<ProjectTag>();

    public DbSet<BlogPost> BlogPosts => Set<BlogPost>();

    public DbSet<BlogPostTag> BlogPostTags => Set<BlogPostTag>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Tag> Tags => Set<Tag>();

    public DbSet<Skill> Skills => Set<Skill>();

    public DbSet<ProfileInfo> Profiles => Set<ProfileInfo>();

    public DbSet<Experience> Experiences => Set<Experience>();

    public DbSet<Education> EducationItems => Set<Education>();

    public DbSet<Certificate> Certificates => Set<Certificate>();

    public DbSet<SocialLink> SocialLinks => Set<SocialLink>();

    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();

    public DbSet<SiteSetting> SiteSettings => Set<SiteSetting>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditValues();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        ApplyAuditValues();
        return base.SaveChanges();
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        ConfigureIdentity(builder);
        ConfigureContent(builder);
        ConfigureProfile(builder);
        ConfigureMessaging(builder);
        ConfigureMedia(builder);
        ConfigureSettings(builder);
    }

    private static void ConfigureIdentity(ModelBuilder builder)
    {
        builder.Entity<ApplicationUser>(entity =>
        {
            entity.ToTable("Users");
            entity.Property(user => user.FullName).HasMaxLength(160);
            entity.Property(user => user.AvatarUrl).HasMaxLength(500);
        });

        builder.Entity<ApplicationRole>(entity =>
        {
            entity.ToTable("Roles");
            entity.Property(role => role.Description).HasMaxLength(300);
        });

        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<Guid>>().ToTable("UserRoles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<Guid>>().ToTable("UserClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<Guid>>().ToTable("UserLogins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<Guid>>().ToTable("UserTokens");
    }

    private static void ConfigureContent(ModelBuilder builder)
    {
        builder.Entity<Project>(entity =>
        {
            entity.ToTable("Projects");
            entity.HasIndex(project => project.Slug).IsUnique();
            entity.HasIndex(project => new { project.Status, project.Featured, project.PublishedAt });
            entity.Property(project => project.Title).HasMaxLength(200);
            entity.Property(project => project.Slug).HasMaxLength(220);
            entity.Property(project => project.Summary).HasMaxLength(500);
            entity.Property(project => project.ThumbnailUrl).HasMaxLength(500);
            entity.Property(project => project.GithubUrl).HasMaxLength(500);
            entity.Property(project => project.DemoUrl).HasMaxLength(500);
            entity.Property(project => project.VideoUrl).HasMaxLength(500);
            entity.Property(project => project.Status).HasConversion<string>().HasMaxLength(40);
        });

        builder.Entity<ProjectImage>(entity =>
        {
            entity.ToTable("ProjectImages");
            entity.Property(image => image.ImageUrl).HasMaxLength(500);
            entity.Property(image => image.AltText).HasMaxLength(200);
            entity.HasOne(image => image.Project)
                .WithMany(project => project.Images)
                .HasForeignKey(image => image.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<ProjectTag>(entity =>
        {
            entity.ToTable("ProjectTags");
            entity.HasKey(projectTag => new { projectTag.ProjectId, projectTag.TagId });
            entity.HasOne(projectTag => projectTag.Project)
                .WithMany(project => project.ProjectTags)
                .HasForeignKey(projectTag => projectTag.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(projectTag => projectTag.Tag)
                .WithMany(tag => tag.ProjectTags)
                .HasForeignKey(projectTag => projectTag.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<BlogPost>(entity =>
        {
            entity.ToTable("BlogPosts");
            entity.HasIndex(post => post.Slug).IsUnique();
            entity.HasIndex(post => new { post.Status, post.PublishedAt });
            entity.Property(post => post.Title).HasMaxLength(220);
            entity.Property(post => post.Slug).HasMaxLength(240);
            entity.Property(post => post.Summary).HasMaxLength(600);
            entity.Property(post => post.CoverImageUrl).HasMaxLength(500);
            entity.Property(post => post.Status).HasConversion<string>().HasMaxLength(40);
            entity.HasOne(post => post.Category)
                .WithMany(category => category.BlogPosts)
                .HasForeignKey(post => post.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(post => post.Author)
                .WithMany(user => user.BlogPosts)
                .HasForeignKey(post => post.AuthorId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        builder.Entity<BlogPostTag>(entity =>
        {
            entity.ToTable("BlogPostTags");
            entity.HasKey(blogPostTag => new { blogPostTag.BlogPostId, blogPostTag.TagId });
            entity.HasOne(blogPostTag => blogPostTag.BlogPost)
                .WithMany(post => post.BlogPostTags)
                .HasForeignKey(blogPostTag => blogPostTag.BlogPostId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(blogPostTag => blogPostTag.Tag)
                .WithMany(tag => tag.BlogPostTags)
                .HasForeignKey(blogPostTag => blogPostTag.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Category>(entity =>
        {
            entity.ToTable("Categories");
            entity.HasIndex(category => category.Slug).IsUnique();
            entity.Property(category => category.Name).HasMaxLength(120);
            entity.Property(category => category.Slug).HasMaxLength(140);
            entity.Property(category => category.Description).HasMaxLength(500);
        });

        builder.Entity<Tag>(entity =>
        {
            entity.ToTable("Tags");
            entity.HasIndex(tag => tag.Slug).IsUnique();
            entity.Property(tag => tag.Name).HasMaxLength(80);
            entity.Property(tag => tag.Slug).HasMaxLength(100);
        });

        builder.Entity<Skill>(entity =>
        {
            entity.ToTable("Skills");
            entity.Property(skill => skill.Name).HasMaxLength(120);
            entity.Property(skill => skill.GroupName).HasMaxLength(120);
            entity.Property(skill => skill.IconUrl).HasMaxLength(500);
        });
    }

    private static void ConfigureProfile(ModelBuilder builder)
    {
        builder.Entity<ProfileInfo>(entity =>
        {
            entity.ToTable("Profiles");
            entity.Property(profile => profile.Headline).HasMaxLength(220);
            entity.Property(profile => profile.AvatarUrl).HasMaxLength(500);
            entity.Property(profile => profile.ResumeUrl).HasMaxLength(500);
            entity.Property(profile => profile.Location).HasMaxLength(160);
        });

        builder.Entity<Experience>(entity =>
        {
            entity.ToTable("Experiences");
            entity.Property(experience => experience.Company).HasMaxLength(160);
            entity.Property(experience => experience.Position).HasMaxLength(160);
        });

        builder.Entity<Education>(entity =>
        {
            entity.ToTable("Education");
            entity.Property(education => education.School).HasMaxLength(180);
            entity.Property(education => education.Major).HasMaxLength(180);
            entity.Property(education => education.Description).HasMaxLength(800);
        });

        builder.Entity<Certificate>(entity =>
        {
            entity.ToTable("Certificates");
            entity.Property(certificate => certificate.Name).HasMaxLength(180);
            entity.Property(certificate => certificate.Issuer).HasMaxLength(180);
            entity.Property(certificate => certificate.CredentialUrl).HasMaxLength(500);
        });

        builder.Entity<SocialLink>(entity =>
        {
            entity.ToTable("SocialLinks");
            entity.Property(link => link.Platform).HasMaxLength(80);
            entity.Property(link => link.Url).HasMaxLength(500);
            entity.Property(link => link.IconUrl).HasMaxLength(500);
        });
    }

    private static void ConfigureMessaging(ModelBuilder builder)
    {
        builder.Entity<ContactMessage>(entity =>
        {
            entity.ToTable("ContactMessages");
            entity.HasIndex(message => new { message.IsRead, message.CreatedAt });
            entity.Property(message => message.FullName).HasMaxLength(160);
            entity.Property(message => message.Email).HasMaxLength(256);
            entity.Property(message => message.Subject).HasMaxLength(220);
        });
    }

    private static void ConfigureMedia(ModelBuilder builder)
    {
        builder.Entity<MediaFile>(entity =>
        {
            entity.ToTable("MediaFiles");
            entity.HasIndex(file => file.FileType);
            entity.Property(file => file.FileName).HasMaxLength(260);
            entity.Property(file => file.OriginalFileName).HasMaxLength(260);
            entity.Property(file => file.Url).HasMaxLength(500);
            entity.Property(file => file.FileType).HasConversion<string>().HasMaxLength(40);
            entity.Property(file => file.ContentType).HasMaxLength(120);
        });
    }

    private static void ConfigureSettings(ModelBuilder builder)
    {
        builder.Entity<SiteSetting>(entity =>
        {
            entity.ToTable("SiteSettings");
            entity.HasKey(setting => setting.Key);
            entity.Property(setting => setting.Key).HasMaxLength(120);
            entity.Property(setting => setting.GroupName).HasMaxLength(120);
        });
    }

    private void ApplyAuditValues()
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
