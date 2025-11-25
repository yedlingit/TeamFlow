using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TeamFlow.Domain.Entities;
using TeamFlow.Infrastructure.Identity;
using TaskEntity = TeamFlow.Domain.Entities.Task;

namespace TeamFlow.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        // DbSets
        public DbSet<Organization> Organizations { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<UserProject> UserProjects { get; set; } = null!;
        public DbSet<TaskEntity> Tasks { get; set; } = null!;
        public DbSet<TaskAssignment> TaskAssignments { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Composite PKs
            modelBuilder.Entity<UserProject>()
                .HasKey(up => new { up.UserId, up.ProjectId });

            modelBuilder.Entity<TaskAssignment>()
                .HasKey(ta => new { ta.TaskId, ta.UserId });

            // Organization → Users (one‑to‑many)
            modelBuilder.Entity<ApplicationUser>()
                .HasOne(u => u.Organization)
                .WithMany()
                .HasForeignKey(u => u.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Organization → Projects (one‑to‑many)
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Organization)
                .WithMany(o => o.Projects)
                .HasForeignKey(p => p.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Project → TeamLeader (optional)
            modelBuilder.Entity<Project>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(p => p.TeamLeaderId)
                .OnDelete(DeleteBehavior.SetNull);

            // Project → Tasks (one‑to‑many)
            modelBuilder.Entity<TaskEntity>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Task ↔ User (many‑to‑many) – via TaskAssignment
            modelBuilder.Entity<TaskAssignment>()
                .HasOne(ta => ta.Task)
                .WithMany(t => t.TaskAssignments)
                .HasForeignKey(ta => ta.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskAssignment>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(ta => ta.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment → Task (many‑to‑one)
            modelBuilder.Entity<Comment>()
                .HasOne<TaskEntity>()
                .WithMany(t => t.Comments)
                .HasForeignKey(c => c.TaskId)
                .OnDelete(DeleteBehavior.Cascade);

            // Comment → Author (User)
            modelBuilder.Entity<Comment>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(c => c.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unikalny indeks na InvitationCode
            modelBuilder.Entity<Organization>()
                .HasIndex(o => o.InvitationCode)
                .IsUnique();

            // Indeksy dla wydajności
            // Projects
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.OrganizationId);
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.Status);
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.TeamLeaderId);

            // Tasks
            modelBuilder.Entity<TaskEntity>()
                .HasIndex(t => t.ProjectId);
            modelBuilder.Entity<TaskEntity>()
                .HasIndex(t => t.Status);
            modelBuilder.Entity<TaskEntity>()
                .HasIndex(t => t.Priority);
            modelBuilder.Entity<TaskEntity>()
                .HasIndex(t => t.DueDate);

            // UserProjects
            modelBuilder.Entity<UserProject>()
                .HasIndex(up => up.UserId);
            modelBuilder.Entity<UserProject>()
                .HasIndex(up => up.ProjectId);

            // TaskAssignments
            modelBuilder.Entity<TaskAssignment>()
                .HasIndex(ta => ta.UserId);
            modelBuilder.Entity<TaskAssignment>()
                .HasIndex(ta => ta.TaskId);

            // Comments
            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.TaskId);
            modelBuilder.Entity<Comment>()
                .HasIndex(c => c.AuthorId);

            // Users (ApplicationUser)
            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.OrganizationId);
            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.Role);
        }

        // Opcjonalnie: automatyczna aktualizacja UpdatedAt w Task
        public override int SaveChanges()
        {
            foreach (var entry in ChangeTracker.Entries<TaskEntity>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
            return base.SaveChanges();
        }

        public override async System.Threading.Tasks.Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<TaskEntity>())
            {
                if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                }
            }
            return await base.SaveChangesAsync(cancellationToken);
        }
    }
}

