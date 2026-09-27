using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAll();
        Task<ProjectDto?> GetProjectById(int id);
        Task<IEnumerable<ProjectDto>> GetProjectsByFaculty(int facultyId);
        Task<IEnumerable<ProjectDto>> GetProjectsByStudent(int studentId);
        Task<bool> IsStudentAllocated(int projectId, int studentId);
        Task<ProjectDto> CreateProject(ProjectDto dto);
        Task<bool> UpdateProject(int id, ProjectDto dto);
        Task<bool> DeleteProject(int id);
    }
}
