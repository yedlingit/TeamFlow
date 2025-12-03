using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using TeamFlow.API.Controllers;
using TeamFlow.API.DTOs.Tasks;
using TeamFlow.Domain.Entities;
using TeamFlow.Domain.Enums;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;
using Xunit;
using TaskStatus = TeamFlow.Domain.Enums.TaskStatus;

namespace TeamFlow.Tests
{
    public class TasksControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<UserManager<ApplicationUser>> _userManagerMock;
        private Mock<ILogger<TasksController>> _loggerMock;
        private TasksController _controller;

        public TasksControllerTests()
        {
            // Konfiguracja bazy danych InMemory
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            // Konfiguracja mocka UserManager
            var store = new Mock<IUserStore<ApplicationUser>>();
            _userManagerMock = new Mock<UserManager<ApplicationUser>>(store.Object, null, null, null, null, null, null, null, null);

            // Konfiguracja mocka Logger
            _loggerMock = new Mock<ILogger<TasksController>>();

            // Inicjalizacja kontrolera
            _controller = new TasksController(_context, _userManagerMock.Object, _loggerMock.Object);
        }

        private void SetupUser(string userId, string role = "Member", int? organizationId = 1)
        {
            var user = new ApplicationUser
            {
                Id = userId,
                UserName = "testuser",
                Email = "test@example.com",
                OrganizationId = organizationId,
                Role = Enum.Parse<UserRole>(role)
            };

            _userManagerMock.Setup(x => x.GetUserId(It.IsAny<ClaimsPrincipal>())).Returns(userId);
            _userManagerMock.Setup(x => x.FindByIdAsync(userId)).ReturnsAsync(user);
            
            // Mockowanie kontekstu kontrolera
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Name, "testuser")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);
            
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = claimsPrincipal }
            };
        }

        [Fact]
        public async System.Threading.Tasks.Task CreateTask_ReturnsCreated_WhenDataIsValid()
        {
            // Przygotowanie
            var userId = "user1";
            var projectId = 1;
            SetupUser(userId, "TeamLeader");

            var organization = new Organization { Id = 1, Name = "Test Org", InvitationCode = "INV123" };
            _context.Organizations.Add(organization);

            var project = new Project 
            { 
                Id = projectId, 
                Name = "Test Project", 
                OrganizationId = 1,
                TeamLeaderId = userId // Użytkownik jest liderem projektu
            };
            _context.Projects.Add(project);
            
            // Użytkownik musi być w projekcie
            _context.UserProjects.Add(new UserProject { UserId = userId, ProjectId = projectId, JoinedDate = DateTime.UtcNow });
            
            await _context.SaveChangesAsync();

            var dto = new CreateTaskDto
            {
                Title = "New Task",
                Description = "Description",
                ProjectId = projectId,
                Priority = TaskPriority.High,
                DueDate = DateTime.UtcNow.AddDays(1)
            };

            // Działanie
            var result = await _controller.CreateTask(dto);

            // Asercja
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnDto = Assert.IsType<TaskDto>(createdResult.Value);
            Assert.Equal(dto.Title, returnDto.Title);
            Assert.Equal(TaskStatus.ToDo, returnDto.Status);
        }

        [Fact]
        public async System.Threading.Tasks.Task CreateTask_ReturnsForbidden_WhenUserIsNotAuthorized()
        {
            // Przygotowanie
            var userId = "user2";
            var projectId = 2;
            SetupUser(userId, "Member"); // Członek zwykle nie może tworzyć zadań (logika to zabrania)

            var organization = new Organization { Id = 1, Name = "Test Org", InvitationCode = "INV123" };
            _context.Organizations.Add(organization);

            var project = new Project 
            { 
                Id = projectId, 
                Name = "Test Project", 
                OrganizationId = 1 
            };
            _context.Projects.Add(project);
            
            // Użytkownik jest w projekcie, ale jest tylko członkiem
            _context.UserProjects.Add(new UserProject { UserId = userId, ProjectId = projectId, JoinedDate = DateTime.UtcNow });
            
            await _context.SaveChangesAsync();

            var dto = new CreateTaskDto
            {
                Title = "New Task",
                ProjectId = projectId
            };

            // Działanie
            var result = await _controller.CreateTask(dto);

            // Asercja
            Assert.IsType<ObjectResult>(result);
            var objectResult = result as ObjectResult;
            Assert.Equal(StatusCodes.Status403Forbidden, objectResult.StatusCode);
        }

        [Fact]
        public async System.Threading.Tasks.Task UpdateTask_UpdatesStatus_WhenUserIsMemberAndAssigned()
        {
            // Przygotowanie
            var userId = "user3";
            var taskId = 10;
            var projectId = 3;
            SetupUser(userId, "Member");

            var organization = new Organization { Id = 1, Name = "Test Org", InvitationCode = "INV123" };
            _context.Organizations.Add(organization);

            var project = new Project { Id = projectId, Name = "Test Project", OrganizationId = 1 };
            _context.Projects.Add(project);
            
            var task = new TeamFlow.Domain.Entities.Task
            {
                Id = taskId,
                Title = "Task to Update",
                ProjectId = projectId,
                Status = TaskStatus.ToDo
            };
            _context.Tasks.Add(task);

            _context.UserProjects.Add(new UserProject { UserId = userId, ProjectId = projectId, JoinedDate = DateTime.UtcNow });
            
            // Przypisanie użytkownika do zadania, aby mógł zaktualizować status
            _context.TaskAssignments.Add(new TaskAssignment { TaskId = taskId, UserId = userId, AssignedAt = DateTime.UtcNow });

            await _context.SaveChangesAsync();

            var dto = new UpdateTaskStatusDto
            {
                Status = TaskStatus.InProgress
            };

            // Działanie
            var result = await _controller.UpdateTaskStatus(taskId, dto);

            // Asercja
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnDto = Assert.IsType<TaskDto>(okResult.Value);
            Assert.Equal(TaskStatus.InProgress, returnDto.Status);
        }
    }
}
