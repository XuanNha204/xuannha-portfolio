using XuanNha.Dev.Dtos.Taxonomy;

namespace XuanNha.Dev.Services.Taxonomy;

public interface ICategoryService
{
    Task<IReadOnlyCollection<CategoryDto>> GetAllAsync(CancellationToken cancellationToken);

    Task<CategoryDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<CategoryDto> CreateAsync(SaveCategoryRequest request, CancellationToken cancellationToken);

    Task<CategoryDto?> UpdateAsync(Guid id, SaveCategoryRequest request, CancellationToken cancellationToken);

    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
