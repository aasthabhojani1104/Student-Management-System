using AutoMapper;
using Student_Management_System.DTO;
using Student_Management_System.Model;

namespace Student_Management_System.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Role
            CreateMap<RoleDto, RoleModel>();
            CreateMap<RoleModel, RoleDto>();

            // Status
            CreateMap<StatusDto, StatusModel>()
                .ForMember(dest => dest.StatusID, opt => opt.Ignore());
            CreateMap<StatusModel, StatusDto>();

            // User
            CreateMap<UserDto, UserModel>()
                .ForMember(dest => dest.Password, opt => opt.Ignore());
            CreateMap<UserModel, UserDto>()
                .ForMember(dest => dest.Password, opt => opt.Ignore());

            // UserRole
            CreateMap<UserRoleDto, UserRoleModel>()
                .ForMember(dest => dest.RolePermissionId, opt => opt.Ignore());
            CreateMap<UserRoleModel, UserRoleDto>();

            // Priority
            CreateMap<PriorityDto, PriorityModel>()
                .ForMember(dest => dest.PriorityID, opt => opt.Ignore());
            CreateMap<PriorityModel, PriorityDto>()
                .ForMember(dest => dest.PriorityId, opt => opt.MapFrom(src => src.PriorityID));

            // Project
            CreateMap<ProjectDto, ProjectModel>()
                .ForMember(dest => dest.ProjectId,          opt => opt.Ignore())
                .ForMember(dest => dest.Status,             opt => opt.Ignore())
                .ForMember(dest => dest.Faculty,            opt => opt.Ignore())
                .ForMember(dest => dest.ProjectAllocations, opt => opt.Ignore());
            CreateMap<ProjectModel, ProjectDto>()
                .ForMember(dest => dest.StatusName,     opt => opt.MapFrom(src => src.Status != null ? src.Status.StatusName : null))
                .ForMember(dest => dest.StatusCssClass, opt => opt.MapFrom(src => src.Status != null ? src.Status.StatusCssClass : null))
                .ForMember(dest => dest.FacultyName,    opt => opt.MapFrom(src => src.Faculty != null ? src.Faculty.FullName : null));

            // ProjectAllocation
            CreateMap<ProjectAllocationDto, ProjectAllocationModel>()
                .ForMember(dest => dest.AllocationID, opt => opt.Ignore())
                .ForMember(dest => dest.Project,      opt => opt.Ignore())
                .ForMember(dest => dest.Student,      opt => opt.Ignore())
                .ForMember(dest => dest.Tasks,        opt => opt.Ignore());
            CreateMap<ProjectAllocationModel, ProjectAllocationDto>()
                .ForMember(dest => dest.AllocationId,  opt => opt.MapFrom(src => src.AllocationID))
                .ForMember(dest => dest.ProjectTitle,  opt => opt.MapFrom(src => src.Project != null ? src.Project.ProjectTitle : null))
                .ForMember(dest => dest.StudentName,   opt => opt.MapFrom(src => src.Student != null ? src.Student.FullName : null));

            // Task
            CreateMap<TaskDto, TaskModel>()
                .ForMember(dest => dest.TaskId,     opt => opt.Ignore())
                .ForMember(dest => dest.AllocationID, opt => opt.MapFrom(src => src.AllocationId))
                .ForMember(dest => dest.PriorityID,  opt => opt.MapFrom(src => src.PriorityId))
                .ForMember(dest => dest.Allocation,  opt => opt.Ignore())
                .ForMember(dest => dest.Status,      opt => opt.Ignore())
                .ForMember(dest => dest.Priority,    opt => opt.Ignore());
            CreateMap<TaskModel, TaskDto>()
                .ForMember(dest => dest.AllocationId,    opt => opt.MapFrom(src => src.AllocationID))
                .ForMember(dest => dest.PriorityId,      opt => opt.MapFrom(src => src.PriorityID))
                .ForMember(dest => dest.StatusName,      opt => opt.MapFrom(src => src.Status != null ? src.Status.StatusName : null))
                .ForMember(dest => dest.StatusCssClass,  opt => opt.MapFrom(src => src.Status != null ? src.Status.StatusCssClass : null))
                .ForMember(dest => dest.PriorityName,    opt => opt.MapFrom(src => src.Priority != null ? src.Priority.PriorityName : null))
                .ForMember(dest => dest.PriorityCssClass, opt => opt.MapFrom(src => src.Priority != null ? src.Priority.PriorityCssClass : null))
                .ForMember(dest => dest.ProjectTitle,    opt => opt.MapFrom(src => src.Allocation != null && src.Allocation.Project != null ? src.Allocation.Project.ProjectTitle : null))
                .ForMember(dest => dest.StudentName,     opt => opt.MapFrom(src => src.Allocation != null && src.Allocation.Student != null ? src.Allocation.Student.FullName : null));
        }
    }
}
