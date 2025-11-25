using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TeamFlow.API.DTOs.Dashboard;
using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<DashboardController> _logger;

        public DashboardController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<DashboardController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Pobranie statystyk dla dashboardu
        /// </summary>
        [HttpGet("stats")]
        [ProducesResponseType(typeof(DashboardStatsDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStats()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || !user.OrganizationId.HasValue)
            {
                return BadRequest(new { error = "Użytkownik nie należy do żadnej organizacji" });
            }

            var organizationId = user.OrganizationId.Value;

            // Pobierz projekty, do których użytkownik należy
            var userProjectIds = await _context.UserProjects
                .AsNoTracking()
                .Where(up => up.UserId == userId)
                .Select(up => up.ProjectId)
                .ToListAsync();

            // Statystyki zadań
            var allTasks = await _context.Tasks
                .AsNoTracking()
                .Where(t => t.Project.OrganizationId == organizationId &&
                           userProjectIds.Contains(t.ProjectId))
                .ToListAsync();

            var taskStats = new TaskStatsDto
            {
                Total = allTasks.Count,
                ToDo = allTasks.Count(t => t.Status == TaskStatusEnum.ToDo),
                InProgress = allTasks.Count(t => t.Status == TaskStatusEnum.InProgress),
                Done = allTasks.Count(t => t.Status == TaskStatusEnum.Done)
            };

            // Statystyki projektów
            var allProjects = await _context.Projects
                .AsNoTracking()
                .Where(p => p.OrganizationId == organizationId &&
                           p.UserProjects.Any(up => up.UserId == userId))
                .ToListAsync();

            var projectStats = new ProjectStatsDto
            {
                Total = allProjects.Count,
                Active = allProjects.Count(p => p.Status == ProjectStatus.Active),
                Inactive = allProjects.Count(p => p.Status == ProjectStatus.Inactive)
            };

            // Najbliższe zadania (z terminem w ciągu 7 dni)
            var upcomingDate = DateTime.UtcNow.AddDays(7);
            var upcomingTasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Project)
                .Where(t => t.Project.OrganizationId == organizationId &&
                           userProjectIds.Contains(t.ProjectId) &&
                           t.DueDate.HasValue &&
                           t.DueDate.Value <= upcomingDate &&
                           t.Status != TaskStatusEnum.Done)
                .OrderBy(t => t.DueDate)
                .Take(10)
                .ToListAsync();

            var upcomingTaskDtos = upcomingTasks.Select(t => new UpcomingTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                ProjectId = t.ProjectId,
                ProjectName = t.Project?.Name,
                DueDate = t.DueDate,
                Priority = t.Priority.ToString()
            }).ToList();

            // Aktywne projekty (z postępem)
            var activeProjects = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Tasks)
                .Include(p => p.UserProjects)
                .Where(p => p.OrganizationId == organizationId &&
                           p.Status == ProjectStatus.Active &&
                           p.UserProjects.Any(up => up.UserId == userId))
                .OrderByDescending(p => p.CreatedAt)
                .Take(5)
                .ToListAsync();

            var activeProjectDtos = activeProjects.Select(p =>
            {
                var totalTasks = p.Tasks?.Count ?? 0;
                var doneTasks = p.Tasks?.Count(t => t.Status == TaskStatusEnum.Done) ?? 0;
                var progress = totalTasks > 0 ? (int)Math.Round((double)doneTasks / totalTasks * 100) : 0;

                return new ActiveProjectDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Progress = progress,
                    TaskCount = totalTasks,
                    MemberCount = p.UserProjects?.Count ?? 0
                };
            }).ToList();

            var stats = new DashboardStatsDto
            {
                TaskStats = taskStats,
                ProjectStats = projectStats,
                UpcomingTasks = upcomingTaskDtos,
                ActiveProjects = activeProjectDtos
            };

            return Ok(stats);
        }
    }
}

