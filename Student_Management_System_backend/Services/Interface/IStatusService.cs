using Student_Management_System.DTO;

namespace Student_Management_System.Services.Interface
{
    public interface IStatusService
    {

        Task<IEnumerable<StatusDto>> GetAllStatus();
        Task<StatusDto?> GetStatusById(int id); 
        Task<StatusDto?> AddStatus(StatusDto dto);
        Task<bool> UpdateStatus(int id, StatusDto dto);
        Task<bool> DeleteStatus(int id);
    }
}
