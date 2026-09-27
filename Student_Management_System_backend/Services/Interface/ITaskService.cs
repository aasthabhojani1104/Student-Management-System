using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface ITaskService
    {
        Task<IEnumerable<TaskDto>> GetAll();
        Task<TaskDto?> GetById(int taskId);
        Task<IEnumerable<TaskDto>> GetByAllocation(int allocationId);
        Task<IEnumerable<TaskDto>> GetByStudent(int studentId);
        Task<IEnumerable<TaskDto>> GetByFaculty(int facultyId);
        Task<TaskDto> Create(TaskDto dto);
        Task<bool> Update(int id, TaskDto dto);
        Task<bool> Delete(int id);
    }
}
