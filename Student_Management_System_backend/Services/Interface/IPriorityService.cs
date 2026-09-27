using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IPriorityService
    {
        Task<IEnumerable<PriorityDto>> GetAll();
        Task<PriorityDto?> GetById(int id);
        Task<PriorityDto?> Add(PriorityDto dto);       // null = duplicate name
        Task<bool> Update(int id, PriorityDto dto);
        Task<bool> Delete(int id);
    }
}
