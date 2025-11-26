using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TeamFlow.API.DTOs.Common;
using TeamFlow.API.DTOs.Comments;
using TeamFlow.API.DTOs.Tasks;
using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;
using TaskEntity = TeamFlow.Domain.Entities.Task;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<TasksController> _logger;

        public TasksController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<TasksController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Pobranie listy zadań
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(TeamFlow.API.DTOs.Common.PagedResultDto<TaskDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetTasks(
            [FromQuery] int? projectId,
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] string? assigneeId,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50,
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
            var userProjectIds = await _context.UserProjects
                .AsNoTracking()
                .Where(up => up.UserId == userId)
                .Select(up => up.ProjectId)
                .ToListAsync();

            // Pobierz zadania z projektów użytkownika
            var query = _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.TaskAssignments)
                .Include(t => t.Comments)
                .Where(t => t.Project.OrganizationId == organizationId &&
                           userProjectIds.Contains(t.ProjectId));

            // Filtrowanie po projekcie
            if (projectId.HasValue)
            {
                if (!userProjectIds.Contains(projectId.Value))
                {
                    return Forbid();
                }
                query = query.Where(t => t.ProjectId == projectId.Value);
            }

            // Filtrowanie po statusie
            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<TaskStatusEnum>(status, true, out var taskStatus))
                {
                    query = query.Where(t => t.Status == taskStatus);
                }
            }

            // Filtrowanie po priorytecie
            if (!string.IsNullOrEmpty(priority))
            {
                if (Enum.TryParse<TaskPriority>(priority, true, out var taskPriority))
                {
                    query = query.Where(t => t.Priority == taskPriority);
                }
            }

            // Filtrowanie po przypisanym użytkowniku
            if (!string.IsNullOrEmpty(assigneeId))
            {
                query = query.Where(t => t.TaskAssignments.Any(ta => ta.UserId == assigneeId));
            }

            // Wyszukiwanie
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(t =>
                    t.Title.Contains(search) ||
                    (t.Description != null && t.Description.Contains(search)));
            }

            // Sortowanie
            query = sortBy?.ToLower() switch
            {
                "title" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(t => t.Title)
                    : query.OrderByDescending(t => t.Title),
                "priority" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(t => t.Priority)
                    : query.OrderByDescending(t => t.Priority),
                "status" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(t => t.Status)
                    : query.OrderByDescending(t => t.Status),
                "duedate" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(t => t.DueDate ?? DateTime.MaxValue)
                    : query.OrderByDescending(t => t.DueDate ?? DateTime.MinValue),
                "createdat" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(t => t.CreatedAt)
                    : query.OrderByDescending(t => t.CreatedAt),
                _ => query.OrderByDescending(t => t.CreatedAt) // Domyślnie: najnowsze
            };

            // Paginacja
            var totalCount = await query.CountAsync();
            var tasks = await query
                .AsNoTracking()
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var taskDtos = new List<TaskDto>();
            foreach (var task in tasks)
            {
                taskDtos.Add(await MapToTaskDtoAsync(task));
            }

            var result = new TeamFlow.API.DTOs.Common.PagedResultDto<TaskDto>
            {
                Items = taskDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        /// <summary>
        /// Pobranie szczegółów zadania
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(TaskDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetTask(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var task = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.Project)
                .Include(t => t.TaskAssignments)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            var userProject = await _context.UserProjects
                .FirstOrDefaultAsync(up => up.UserId == userId && up.ProjectId == task.ProjectId);

            if (userProject == null)
            {
                return Forbid();
            }

            var taskDetailDto = await MapToTaskDetailDtoAsync(task);
            return Ok(taskDetailDto);
        }

        /// <summary>
        /// Utworzenie nowego zadania
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
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
            if (user == null)
            {
                return Unauthorized(new { error = "Użytkownik nie został znaleziony" });
            }

            // Sprawdź czy projekt istnieje
            var project = await _context.Projects
                .Include(p => p.UserProjects)
                .FirstOrDefaultAsync(p => p.Id == dto.ProjectId);

            if (project == null)
            {
                return NotFound(new { error = "Projekt nie został znaleziony" });
            }

            // Sprawdź uprawnienia do tworzenia zadań:
            // - Administratorzy mogą tworzyć zadania we wszystkich projektach w organizacji
            // - Project Manager (TeamLeaderId) może tworzyć zadania w swoim projekcie
            // - TeamLeader (rola organizacyjna) może tworzyć zadania w projektach, do których należy
            // - Memberzy NIE mogą tworzyć zadań
            var isProjectManager = !string.IsNullOrEmpty(project.TeamLeaderId) && project.TeamLeaderId == userId;
            var isAdministrator = user.Role == UserRole.Administrator;
            var isTeamLeader = user.Role == UserRole.TeamLeader;
            var isProjectMember = project.UserProjects.Any(up => up.UserId == userId);

            if (!isAdministrator && !isProjectManager && !(isTeamLeader && isProjectMember))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { error = "Nie masz uprawnień do tworzenia zadań w tym projekcie" });
            }

            // Utwórz zadanie
            var task = new TaskEntity
            {
                Title = dto.Title,
                Description = dto.Description,
                ProjectId = dto.ProjectId,
                Status = TaskStatusEnum.ToDo,
                Priority = dto.Priority,
                DueDate = dto.DueDate,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            // Dodaj przypisania (jeśli podano)
            if (dto.AssigneeIds != null && dto.AssigneeIds.Any())
            {
                foreach (var assigneeId in dto.AssigneeIds)
                {
                    // Sprawdź czy użytkownik należy do projektu
                    if (project.UserProjects.Any(up => up.UserId == assigneeId))
                    {
                        _context.TaskAssignments.Add(new TeamFlow.Domain.Entities.TaskAssignment
                        {
                            TaskId = task.Id,
                            UserId = assigneeId,
                            AssignedAt = DateTime.UtcNow
                        });
                    }
                }
                await _context.SaveChangesAsync();
            }

            // Pobierz utworzone zadanie z wszystkimi danymi
            var createdTask = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.TaskAssignments)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == task.Id);

            var taskDto = await MapToTaskDtoAsync(createdTask!);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, taskDto);
        }

        /// <summary>
        /// Aktualizacja zadania
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
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
            if (user == null)
            {
                return Unauthorized(new { error = "Użytkownik nie został znaleziony" });
            }

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .Include(t => t.TaskAssignments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Sprawdź uprawnienia do edycji zadania
            // Administratorzy mogą edytować wszystkie zadania w organizacji
            // Project Manager (TeamLeaderId) może edytować wszystkie zadania w swoim projekcie
            // TeamLeader (rola organizacyjna) może edytować wszystkie zadania w projektach, do których należy
            // Memberzy NIE mogą edytować zadań (tylko zmiana statusu)
            var isProjectManager = !string.IsNullOrEmpty(task.Project.TeamLeaderId) && task.Project.TeamLeaderId == userId;
            var isAdministrator = user.Role == UserRole.Administrator;
            var isTeamLeader = user.Role == UserRole.TeamLeader;

            if (user.Role == UserRole.Member)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { error = "Memberzy nie mogą edytować zadań. Możesz tylko zmieniać status swoich zadań." });
            }
            // Project Manager, Administrator i TeamLeader mogą edytować wszystkie zadania w projekcie

            // Aktualizuj pola
            if (!string.IsNullOrEmpty(dto.Title))
            {
                task.Title = dto.Title;
            }
            if (dto.Description != null)
            {
                task.Description = dto.Description;
            }
            if (dto.Status.HasValue)
            {
                task.Status = dto.Status.Value;
            }
            if (dto.Priority.HasValue)
            {
                task.Priority = dto.Priority.Value;
            }
            if (dto.DueDate.HasValue)
            {
                task.DueDate = dto.DueDate;
            }

            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Pobierz zaktualizowane zadanie
            var updatedTask = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.TaskAssignments)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            var taskDto = await MapToTaskDtoAsync(updatedTask!);
            return Ok(taskDto);
        }

        /// <summary>
        /// Zmiana statusu zadania (dla drag & drop)
        /// </summary>
        [HttpPatch("{id}/status")]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusDto dto)
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
            if (user == null)
            {
                return Unauthorized(new { error = "Użytkownik nie został znaleziony" });
            }

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .Include(t => t.TaskAssignments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Sprawdź uprawnienia do zmiany statusu zadania
            // Administratorzy mogą zmieniać status wszystkich zadań w organizacji
            // Project Manager (TeamLeaderId) może zmieniać status wszystkich zadań w swoim projekcie
            // TeamLeader (rola organizacyjna) może zmieniać status wszystkich zadań w projektach, do których należy
            // Memberzy mogą zmieniać status tylko zadań, do których są przypisani
            var isProjectManager = !string.IsNullOrEmpty(task.Project.TeamLeaderId) && task.Project.TeamLeaderId == userId;
            var isAdministrator = user.Role == UserRole.Administrator;
            var isTeamLeader = user.Role == UserRole.TeamLeader;
            var isAssignedToTask = task.TaskAssignments.Any(ta => ta.UserId == userId);

            if (user.Role == UserRole.Member)
            {
                if (!isAssignedToTask)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { error = "Możesz zmieniać status tylko swoich zadań" });
                }
            }
            // Project Manager, Administrator i TeamLeader mogą zmieniać status wszystkich zadań w projekcie

            task.Status = dto.Status;
            task.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Pobierz zaktualizowane zadanie
            var updatedTask = await _context.Tasks
                .Include(t => t.Project)
                .Include(t => t.TaskAssignments)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            var taskDto = await MapToTaskDtoAsync(updatedTask!);
            return Ok(taskDto);
        }

        /// <summary>
        /// Usunięcie zadania
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Dodanie przypisania użytkownika do zadania
        /// </summary>
        [HttpPost("{id}/assignees")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddTaskAssignee(int id, [FromBody] AddTaskAssigneeDto dto)
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

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .Include(t => t.TaskAssignments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Sprawdź czy użytkownik do przypisania należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == dto.UserId))
            {
                return BadRequest(new { error = "Użytkownik musi należeć do projektu" });
            }

            // Sprawdź czy już jest przypisany
            if (task.TaskAssignments.Any(ta => ta.UserId == dto.UserId))
            {
                return BadRequest(new { error = "Użytkownik już jest przypisany do zadania" });
            }

            // Dodaj przypisanie
            _context.TaskAssignments.Add(new TeamFlow.Domain.Entities.TaskAssignment
            {
                TaskId = task.Id,
                UserId = dto.UserId,
                AssignedAt = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, null);
        }

        /// <summary>
        /// Usunięcie przypisania użytkownika z zadania
        /// </summary>
        [HttpDelete("{id}/assignees/{assigneeUserId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RemoveTaskAssignee(int id, string assigneeUserId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .Include(t => t.TaskAssignments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            var assignment = task.TaskAssignments.FirstOrDefault(ta => ta.UserId == assigneeUserId);
            if (assignment == null)
            {
                return NotFound(new { error = "Przypisanie nie zostało znalezione" });
            }

            _context.TaskAssignments.Remove(assignment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Pobranie komentarzy zadania
        /// </summary>
        [HttpGet("{id}/comments")]
        [ProducesResponseType(typeof(List<CommentDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetTaskComments(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .Include(t => t.Comments)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            var commentDtos = new List<CommentDto>();
            foreach (var comment in task.Comments.OrderBy(c => c.CreatedAt))
            {
                var author = await _userManager.FindByIdAsync(comment.AuthorId);
                if (author != null)
                {
                    var firstName = author.FirstName ?? "";
                    var lastName = author.LastName ?? "";
                    var authorName = $"{firstName} {lastName}".Trim();
                    if (string.IsNullOrEmpty(authorName))
                    {
                        authorName = author.Email ?? "";
                    }

                    var initials = "";
                    if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
                    {
                        initials = $"{firstName[0]}{lastName[0]}".ToUpper();
                    }
                    else if (!string.IsNullOrEmpty(author.Email))
                    {
                        initials = author.Email[0].ToString().ToUpper();
                    }

                    commentDtos.Add(new CommentDto
                    {
                        Id = comment.Id,
                        Content = comment.Content,
                        TaskId = comment.TaskId,
                        AuthorId = comment.AuthorId,
                        AuthorName = authorName,
                        AuthorInitials = initials,
                        CreatedAt = comment.CreatedAt
                    });
                }
            }

            return Ok(commentDtos);
        }

        /// <summary>
        /// Dodanie komentarza do zadania
        /// </summary>
        [HttpPost("{id}/comments")]
        [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddTaskComment(int id, [FromBody] CreateCommentDto dto)
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

            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik należy do projektu
            if (!task.Project.UserProjects.Any(up => up.UserId == userId))
            {
                return Forbid();
            }

            // Utwórz komentarz
            var comment = new TeamFlow.Domain.Entities.Comment
            {
                Content = dto.Content,
                TaskId = task.Id,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Pobierz komentarz z danymi autora
            var author = await _userManager.FindByIdAsync(userId);
            var firstName = author?.FirstName ?? "";
            var lastName = author?.LastName ?? "";
            var authorName = $"{firstName} {lastName}".Trim();
            if (string.IsNullOrEmpty(authorName))
            {
                authorName = author?.Email ?? "";
            }

            var initials = "";
            if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
            {
                initials = $"{firstName[0]}{lastName[0]}".ToUpper();
            }
            else if (!string.IsNullOrEmpty(author?.Email))
            {
                initials = author.Email[0].ToString().ToUpper();
            }

            var commentDto = new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                TaskId = comment.TaskId,
                AuthorId = comment.AuthorId,
                AuthorName = authorName,
                AuthorInitials = initials,
                CreatedAt = comment.CreatedAt
            };

            return CreatedAtAction(nameof(GetTaskComments), new { id = task.Id }, commentDto);
        }

        /// <summary>
        /// Usunięcie komentarza
        /// </summary>
        [HttpDelete("comments/{commentId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var comment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
            {
                return NotFound(new { error = "Komentarz nie został znaleziony" });
            }

            // Pobierz zadanie i projekt
            var task = await _context.Tasks
                .Include(t => t.Project)
                    .ThenInclude(p => p.UserProjects)
                .FirstOrDefaultAsync(t => t.Id == comment.TaskId);

            if (task == null)
            {
                return NotFound(new { error = "Zadanie nie zostało znalezione" });
            }

            // Sprawdź czy użytkownik jest autorem komentarza
            // Tylko autor może usuwać swoje komentarze
            var isAuthor = comment.AuthorId == userId;
            if (!isAuthor)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { error = "Możesz usuwać tylko swoje komentarze" });
            }

            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Mapowanie encji Task do TaskDto
        /// </summary>
        private async Task<TaskDto> MapToTaskDtoAsync(TaskEntity task)
        {
            var assignees = new List<TaskAssigneeDto>();
            foreach (var assignment in task.TaskAssignments)
            {
                var user = await _userManager.FindByIdAsync(assignment.UserId);
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

                    assignees.Add(new TaskAssigneeDto
                    {
                        UserId = assignment.UserId,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email ?? "",
                        Initials = initials,
                        AssignedAt = assignment.AssignedAt
                    });
                }
            }

            return new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                ProjectId = task.ProjectId,
                ProjectName = task.Project?.Name,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Assignees = assignees,
                CommentCount = task.Comments?.Count ?? 0
            };
        }

        /// <summary>
        /// Mapowanie encji Task do TaskDetailDto
        /// </summary>
        private async Task<TaskDetailDto> MapToTaskDetailDtoAsync(TaskEntity task)
        {
            var assignees = new List<TaskAssigneeDto>();
            foreach (var assignment in task.TaskAssignments)
            {
                var user = await _userManager.FindByIdAsync(assignment.UserId);
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

                    assignees.Add(new TaskAssigneeDto
                    {
                        UserId = assignment.UserId,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        Email = user.Email ?? "",
                        Initials = initials,
                        AssignedAt = assignment.AssignedAt
                    });
                }
            }

            var comments = new List<CommentDto>();
            foreach (var comment in task.Comments.OrderBy(c => c.CreatedAt))
            {
                var author = await _userManager.FindByIdAsync(comment.AuthorId);
                if (author != null)
                {
                    var firstName = author.FirstName ?? "";
                    var lastName = author.LastName ?? "";
                    var authorName = $"{firstName} {lastName}".Trim();
                    if (string.IsNullOrEmpty(authorName))
                    {
                        authorName = author.Email ?? "";
                    }

                    var initials = "";
                    if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
                    {
                        initials = $"{firstName[0]}{lastName[0]}".ToUpper();
                    }
                    else if (!string.IsNullOrEmpty(author.Email))
                    {
                        initials = author.Email[0].ToString().ToUpper();
                    }

                    comments.Add(new CommentDto
                    {
                        Id = comment.Id,
                        Content = comment.Content,
                        TaskId = comment.TaskId,
                        AuthorId = comment.AuthorId,
                        AuthorName = authorName,
                        AuthorInitials = initials,
                        CreatedAt = comment.CreatedAt
                    });
                }
            }

            return new TaskDetailDto
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                ProjectId = task.ProjectId,
                ProjectName = task.Project?.Name,
                Status = task.Status,
                Priority = task.Priority,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                Assignees = assignees,
                Comments = comments
            };
        }
    }
}

