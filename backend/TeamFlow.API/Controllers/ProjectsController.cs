using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TeamFlow.API.DTOs.Common;
using TeamFlow.API.DTOs.Projects;
using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<ProjectsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Pobranie listy projektów użytkownika
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(TeamFlow.API.DTOs.Common.PagedResultDto<ProjectDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProjects(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "createdAt",
            [FromQuery] string? sortOrder = "desc")
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
            var query = _context.Projects
                .Include(p => p.Organization)
                .Include(p => p.UserProjects)
                .Include(p => p.Tasks)
                .Where(p => p.OrganizationId == organizationId &&
                           p.UserProjects.Any(up => up.UserId == userId));

            // Filtrowanie po statusie
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<ProjectStatus>(status, true, out var projectStatus))
                {
                    query = query.Where(p => p.Status == projectStatus);
                }
            }

            // Wyszukiwanie
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => 
                    p.Name.Contains(search) || 
                    (p.Description != null && p.Description.Contains(search)));
            }

            // Sortowanie
            query = sortBy?.ToLower() switch
            {
                "name" => sortOrder?.ToLower() == "asc" 
                    ? query.OrderBy(p => p.Name) 
                    : query.OrderByDescending(p => p.Name),
                "createdat" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(p => p.CreatedAt)
                    : query.OrderByDescending(p => p.CreatedAt),
                "duedate" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(p => p.DueDate ?? DateTime.MaxValue)
                    : query.OrderByDescending(p => p.DueDate ?? DateTime.MinValue),
                _ => query.OrderByDescending(p => p.CreatedAt) // Domyślnie: najnowsze
            };

            // Paginacja
            var totalCount = await query.CountAsync();
            var projects = await query
                .AsNoTracking()
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var projectDtos = new List<ProjectDto>();
            foreach (var project in projects)
            {
                projectDtos.Add(await MapToProjectDtoAsync(project, userId));
            }

            var result = new TeamFlow.API.DTOs.Common.PagedResultDto<ProjectDto>
            {
                Items = projectDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        /// <summary>
        /// Pobranie szczegółów projektu
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetProject(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var project = await _context.Projects
                .AsNoTracking()
                .Include(p => p.Organization)
                .Include(p => p.UserProjects)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do organizacji projektu
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || !user.OrganizationId.HasValue || user.OrganizationId.Value != project.OrganizationId)
            {
                return Forbid();
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            var projectDto = await MapToProjectDtoAsync(project, userId, includeMembers: true);
            return Ok(projectDto);
        }

        /// <summary>
        /// Utworzenie nowego projektu
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

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

            // Sprawdź czy TeamLeaderId należy do organizacji (jeśli podano)
            if (!string.IsNullOrEmpty(dto.TeamLeaderId))
            {
                var teamLeader = await _userManager.FindByIdAsync(dto.TeamLeaderId);
                if (teamLeader == null || teamLeader.OrganizationId != organizationId)
                {
                    return BadRequest(new { error = "Lider projektu musi należeć do tej samej organizacji" });
                }
            }

            // Utwórz projekt
            var project = new TeamFlow.Domain.Entities.Project
            {
                Name = dto.Name,
                Description = dto.Description,
                OrganizationId = organizationId,
                TeamLeaderId = dto.TeamLeaderId,
                Theme = dto.Theme,
                DueDate = dto.DueDate,
                Status = ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Dodaj twórcę jako członka projektu
            _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
            {
                UserId = userId,
                ProjectId = project.Id,
                JoinedDate = DateTime.UtcNow,
                Role = "Creator"
            });

            // Dodaj członków (jeśli podano)
            if (dto.MemberIds != null && dto.MemberIds.Any())
            {
                foreach (var memberId in dto.MemberIds)
                {
                    // Sprawdź czy użytkownik należy do organizacji
                    var member = await _userManager.FindByIdAsync(memberId);
                    if (member != null && member.OrganizationId == organizationId && memberId != userId)
                    {
                        // Sprawdź czy już nie jest członkiem
                        if (!await _context.UserProjects.AnyAsync(up => up.UserId == memberId && up.ProjectId == project.Id))
                        {
                            _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
                            {
                                UserId = memberId,
                                ProjectId = project.Id,
                                JoinedDate = DateTime.UtcNow
                            });
                        }
                    }
                }
            }

            // Dodaj TeamLeader jako członka (jeśli podano i nie jest twórcą)
            if (!string.IsNullOrEmpty(dto.TeamLeaderId) && dto.TeamLeaderId != userId)
            {
                if (!await _context.UserProjects.AnyAsync(up => up.UserId == dto.TeamLeaderId && up.ProjectId == project.Id))
                {
                    _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
                    {
                        UserId = dto.TeamLeaderId,
                        ProjectId = project.Id,
                        JoinedDate = DateTime.UtcNow,
                        Role = "Team Leader"
                    });
                }
            }

            await _context.SaveChangesAsync();

            // Pobierz projekt z wszystkimi danymi
            var createdProject = await _context.Projects
                .Include(p => p.Organization)
                .Include(p => p.UserProjects)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            var projectDto = await MapToProjectDtoAsync(createdProject!, userId, includeMembers: true);
            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, projectDto);
        }

        /// <summary>
        /// Aktualizacja projektu
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Sprawdź czy TeamLeaderId należy do organizacji (jeśli podano)
            if (!string.IsNullOrEmpty(dto.TeamLeaderId))
            {
                var teamLeader = await _userManager.FindByIdAsync(dto.TeamLeaderId);
                if (teamLeader == null || teamLeader.OrganizationId != project.OrganizationId)
                {
                    return BadRequest(new { error = "Lider projektu musi należeć do tej samej organizacji" });
                }
            }

            // Aktualizuj pola
            if (!string.IsNullOrEmpty(dto.Name))
            {
                project.Name = dto.Name;
            }
            if (dto.Description != null)
            {
                project.Description = dto.Description;
            }
            if (dto.TeamLeaderId != null)
            {
                project.TeamLeaderId = dto.TeamLeaderId;
            }
            if (dto.Status.HasValue)
            {
                project.Status = dto.Status.Value;
            }
            if (dto.Theme != null)
            {
                project.Theme = dto.Theme;
            }
            if (dto.DueDate.HasValue)
            {
                project.DueDate = dto.DueDate;
            }

            // Aktualizuj członków (jeśli podano)
            if (dto.MemberIds != null)
            {
                // Usuń wszystkich członków oprócz twórcy
                var creatorMembership = project.UserProjects.FirstOrDefault(up => up.UserId == userId);
                var membersToRemove = project.UserProjects
                    .Where(up => up.UserId != userId)
                    .ToList();

                foreach (var member in membersToRemove)
                {
                    _context.UserProjects.Remove(member);
                }

                // Dodaj nowych członków
                foreach (var memberId in dto.MemberIds)
                {
                    if (memberId != userId)
                    {
                        var member = await _userManager.FindByIdAsync(memberId);
                        if (member != null && member.OrganizationId == project.OrganizationId)
                        {
                            _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
                            {
                                UserId = memberId,
                                ProjectId = project.Id,
                                JoinedDate = DateTime.UtcNow
                            });
                        }
                    }
                }

                // Dodaj TeamLeader jako członka (jeśli podano i nie jest twórcą)
                if (!string.IsNullOrEmpty(dto.TeamLeaderId) && dto.TeamLeaderId != userId)
                {
                    if (!dto.MemberIds.Contains(dto.TeamLeaderId))
                    {
                        var teamLeaderMember = await _userManager.FindByIdAsync(dto.TeamLeaderId);
                        if (teamLeaderMember != null && teamLeaderMember.OrganizationId == project.OrganizationId)
                        {
                            _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
                            {
                                UserId = dto.TeamLeaderId,
                                ProjectId = project.Id,
                                JoinedDate = DateTime.UtcNow,
                                Role = "Team Leader"
                            });
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            // Pobierz zaktualizowany projekt
            var updatedProject = await _context.Projects
                .Include(p => p.Organization)
                .Include(p => p.UserProjects)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == id);

            var projectDto = await MapToProjectDtoAsync(updatedProject!, userId, includeMembers: true);
            return Ok(projectDto);
        }

        /// <summary>
        /// Usunięcie projektu
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź czy użytkownik jest twórcą lub administratorem organizacji
            var user = await _userManager.FindByIdAsync(userId);
            var isCreator = project.UserProjects.Any(up => up.UserId == userId && up.Role == "Creator");
            var isAdmin = user != null && user.Role == UserRole.Administrator && user.OrganizationId == project.OrganizationId;

            if (!isCreator && !isAdmin)
            {
                return Forbid();
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Dodanie członka do projektu
        /// </summary>
        [HttpPost("{id}/members")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddProjectMember(int id, [FromBody] AddProjectMemberDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Sprawdź czy użytkownik do dodania należy do organizacji
            var member = await _userManager.FindByIdAsync(dto.UserId);
            if (member == null || member.OrganizationId != project.OrganizationId)
            {
                return BadRequest(new { error = "Użytkownik musi należeć do tej samej organizacji" });
            }

            // Sprawdź czy już jest członkiem
            if (project.UserProjects.Any(up => up.UserId == dto.UserId))
            {
                return BadRequest(new { error = "Użytkownik już jest członkiem projektu" });
            }

            // Dodaj członka
            _context.UserProjects.Add(new TeamFlow.Domain.Entities.UserProject
            {
                UserId = dto.UserId,
                ProjectId = project.Id,
                JoinedDate = DateTime.UtcNow,
                Role = dto.Role
            });

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, null);
        }

        /// <summary>
        /// Usunięcie członka z projektu
        /// </summary>
        [HttpDelete("{id}/members/{memberUserId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RemoveProjectMember(int id, string memberUserId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Nie można usunąć twórcy projektu
            var memberToRemove = project.UserProjects.FirstOrDefault(up => up.UserId == memberUserId);
            if (memberToRemove == null)
            {
                return NotFound(new { error = "Członek nie został znaleziony w projekcie" });
            }

            if (memberToRemove.Role == "Creator")
            {
                return BadRequest(new { error = "Nie można usunąć twórcy projektu" });
            }

            _context.UserProjects.Remove(memberToRemove);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Mapowanie encji Project do ProjectDto
        /// </summary>
        private async Task<ProjectDto> MapToProjectDtoAsync(
            TeamFlow.Domain.Entities.Project project,
            string currentUserId,
            bool includeMembers = false)
        {
            // Oblicz postęp projektu
            var totalTasks = project.Tasks?.Count ?? 0;
            var doneTasks = project.Tasks?.Count(t => t.Status == TaskStatusEnum.Done) ?? 0;
            var progress = totalTasks > 0 ? (int)Math.Round((double)doneTasks / totalTasks * 100) : 0;

            // Pobierz nazwę lidera
            string? teamLeaderName = null;
            if (!string.IsNullOrEmpty(project.TeamLeaderId))
            {
                var teamLeader = await _userManager.FindByIdAsync(project.TeamLeaderId);
                if (teamLeader != null)
                {
                    teamLeaderName = $"{teamLeader.FirstName} {teamLeader.LastName}".Trim();
                    if (string.IsNullOrEmpty(teamLeaderName))
                    {
                        teamLeaderName = teamLeader.Email;
                    }
                }
            }

            var dto = new ProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                OrganizationId = project.OrganizationId,
                TeamLeaderId = project.TeamLeaderId,
                TeamLeaderName = teamLeaderName,
                Status = project.Status,
                Theme = project.Theme,
                DueDate = project.DueDate,
                CreatedAt = project.CreatedAt,
                Progress = progress,
                TaskCount = totalTasks,
                MemberCount = project.UserProjects?.Count ?? 0
            };

            // Dodaj członków (jeśli wymagane)
            if (includeMembers && project.UserProjects != null)
            {
                var members = new List<ProjectMemberDto>();
                foreach (var up in project.UserProjects)
                {
                    var user = await _userManager.FindByIdAsync(up.UserId);
                    if (user != null)
                    {
                        var firstName = user.FirstName ?? "";
                        var lastName = user.LastName ?? "";
                        var initials = "";
                        if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
                        {
                            initials = $"{firstName[0]}{lastName[0]}".ToUpper();
                        }
                        else if (!string.IsNullOrEmpty(user.Email))
                        {
                            initials = user.Email[0].ToString().ToUpper();
                        }

                        members.Add(new ProjectMemberDto
                        {
                            UserId = up.UserId,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            Email = user.Email ?? "",
                            Initials = initials,
                            Role = up.Role,
                            JoinedDate = up.JoinedDate
                        });
                    }
                }
                dto.Members = members;
            }

            return dto;
        }
    }
}

