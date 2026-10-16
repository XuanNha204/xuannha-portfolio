namespace XuanNha.Dev.Entities.Content;

public class ProjectTag
{
    public Guid ProjectId { get; set; }

    public Guid TagId { get; set; }

    public Project? Project { get; set; }

    public Tag? Tag { get; set; }
}
