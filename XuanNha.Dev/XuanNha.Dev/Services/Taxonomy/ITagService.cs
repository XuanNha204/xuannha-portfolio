using XuanNha.Dev.Dtos.Taxonomy;

namespace XuanNha.Dev.Services.Taxonomy;

public interface ITagService
{
    Task<IReadOnlyCollection<TagDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<TagDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<TagDto> CreateAsync(SaveTagRequest request, CancellationToken cancellationToken);

    Task<TagDto?> UpdateAsync(Guid id, SaveTagRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
