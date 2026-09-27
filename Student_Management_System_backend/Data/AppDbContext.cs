using Microsoft.EntityFrameworkCore;
using Student_Management_System.Model;

namespace Student_Management_System.Data
{
    public class AppDbContext: DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
       : base(options) { }


        public DbSet<RoleModel> Roles => Set<RoleModel>();
        public DbSet<UserModel> Users => Set<UserModel>();
        public DbSet<UserRoleModel> UserRoles => Set<UserRoleModel>();

        public DbSet<StatusModel> Statuses => Set<StatusModel>();
        public DbSet<PriorityModel> Priorities => Set<PriorityModel>();

        public DbSet<ProjectModel> Projects => Set<ProjectModel>();

        public DbSet<ProjectAllocationModel> ProjectAllocations => Set<ProjectAllocationModel>();
        public DbSet<TaskModel> Tasks => Set<TaskModel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<UserRoleModel>()
    .HasOne(ur => ur.User)
    .WithMany(u => u.UserRoles)
    .HasForeignKey(ur => ur.UserId)
    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserRoleModel>()
     .HasOne(ur => ur.Role)
     .WithMany(r => r.UserRoles)
     .HasForeignKey(ur => ur.RoleId)
     .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserModel>()
    .HasIndex(u => u.Email)
    .IsUnique();

            modelBuilder.Entity<ProjectModel>()
                .HasOne(p => p.Status)
                .WithMany()
                .HasForeignKey(p => p.ProjectStatus)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectModel>()
                .HasOne(p => p.Faculty)
                .WithMany(u => u.ProjectsAsFaculty)
                .HasForeignKey(p => p.FacultyId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAllocationModel>()
                .HasOne(pa=>pa.Project)
                .WithMany(pa=>pa.ProjectAllocations)
                .HasForeignKey(pa=>pa.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAllocationModel>()
                .HasOne(pa=>pa.Student)
                .WithMany(pa=>pa.ProjectAllocations)
                .HasForeignKey(pa=>pa.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAllocationModel>()
    .HasIndex(pa => new { pa.ProjectId, pa.StudentId })
    .IsUnique();
            modelBuilder.Entity<TaskModel>()
                .HasOne(t=>t.Allocation)
                .WithMany(a=>a.Tasks)
                .HasForeignKey(t=>t.AllocationID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskModel>()
                .HasOne(t=>t.Status)
                .WithMany()
                .HasForeignKey(t=>t.TaskStatus)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskModel>()
                .HasOne(t => t.Priority)
                .WithMany()
                .HasForeignKey(t => t.PriorityID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TaskModel>()
                 .Property(t => t.ProgressPercentage)
                 .HasColumnType("decimal(5,2)")
                 .HasDefaultValue(0.00m);
            modelBuilder.Entity<RoleModel>()
    .HasIndex(r => r.RoleName)
    .IsUnique();

            modelBuilder.Entity<StatusModel>()
    .HasIndex(s => s.StatusName)
    .IsUnique();

            modelBuilder.Entity<PriorityModel>()
    .HasIndex(p => p.PriorityName)
    .IsUnique();
            modelBuilder.Entity<ProjectModel>()
    .Property(p => p.AssignedDate)
    .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<ProjectAllocationModel>()
                .Property(p => p.AssignedDate)
                .HasDefaultValueSql("GETDATE()");

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType)
                        .Property(nameof(BaseEntity.CreatedAt))
                        .HasDefaultValueSql("GETDATE()");

                    modelBuilder.Entity(entityType.ClrType)
                        .Property(nameof(BaseEntity.IsDeleted))
                        .HasDefaultValue(false);
                }
            }


        }
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = DateTime.Now;
                }

                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.Now;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

    }
}
