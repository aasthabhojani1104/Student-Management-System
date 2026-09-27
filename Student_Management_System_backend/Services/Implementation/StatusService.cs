using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Student_Management_System.Data;
using Student_Management_System.DTO;
using Student_Management_System.Model;
using Student_Management_System.Services.Interface;

namespace Student_Management_System.Services.Implementation
{
    public class StatusService:IStatusService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public StatusService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }



        public async Task<IEnumerable<StatusDto>> GetAllStatus()
        {
            var statusList = await _context.Statuses.AsNoTracking().ToListAsync();
            return _mapper.Map<IEnumerable<StatusDto>>(statusList);
        }


        public async Task<StatusDto?> GetStatusById(int id)
        {
            var status = await _context.Statuses.FindAsync(id);
            if (status == null) return null;
            return _mapper.Map<StatusDto>(status);
        }

        public async Task<StatusDto?> AddStatus(StatusDto dto)
        {
            // Prevent duplicate StatusName
            var exists = await _context.Statuses
                .AsNoTracking()
                .AnyAsync(s => s.StatusName.ToLower() == dto.StatusName.ToLower());

            if (exists) return null;   // caller returns 409 Conflict

            var statusModel = _mapper.Map<StatusModel>(dto);
            _context.Statuses.Add(statusModel);
            await _context.SaveChangesAsync();
            return _mapper.Map<StatusDto>(statusModel);
        }

        public async Task<bool> UpdateStatus(int id, StatusDto dto)
        {
            var statusModel = await _context.Statuses.FindAsync(id);
            if (statusModel == null) return false;

            _mapper.Map(dto, statusModel);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteStatus(int id)
        {
            var statusModel = await _context.Statuses.FindAsync(id);
            if (statusModel == null) return false;

            _context.Statuses.Remove(statusModel);
            await _context.SaveChangesAsync();
            return true;
        }

        



    }
}
