using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IProjectAllocationService
    {
        Task<IEnumerable<ProjectAllocationDto>> GetAll();
        Task<ProjectAllocationDto?> GetById(int id);
        Task<IEnumerable<ProjectAllocationDto>> GetByProject(int projectId);
        Task<IEnumerable<ProjectAllocationDto>> GetByStudent(int studentId);
        Task<ProjectAllocationDto?> Allocate(ProjectAllocationDto dto); // null = duplicate
        Task<bool> Remove(int id);
    }
}
