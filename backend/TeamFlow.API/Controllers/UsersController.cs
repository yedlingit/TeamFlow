using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TeamFlow.API.DTOs.Common;
using TeamFlow.API.DTOs.Users;
using TeamFlow.Domain.Enums;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<UsersController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Pobranie listy użytkowników organizacji
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(TeamFlow.API.DTOs.Common.PagedResultDto<UserListDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 30)
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

            var query = _context.Users
                .Where(u => u.OrganizationId == organizationId);

            // Filtrowanie po roli
            if (!string.IsNullOrEmpty(role))
            {
                if (Enum.TryParse<UserRole>(role, true, out var userRole))
                {
                    query = query.Where(u => u.Role == userRole);
                }
            }

            // Wyszukiwanie
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    (u.Email != null && u.Email.Contains(search)) ||
                    (u.FirstName != null && u.FirstName.Contains(search)) ||
                    (u.LastName != null && u.LastName.Contains(search)));
            }

            // Paginacja
            var totalCount = await query.CountAsync();
            var users = await query
                .AsNoTracking()
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var userDtos = new List<UserListDto>();
            foreach (var u in users)
            {
                var firstName = u.FirstName ?? "";
                var lastName = u.LastName ?? "";
                var initials = "";
                if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
                {
                    initials = $"{firstName[0]}{lastName[0]}".ToUpper();
                }
                else if (!string.IsNullOrEmpty(u.Email))
                {
                    initials = u.Email[0].ToString().ToUpper();
                }

                var projectCount = await _context.UserProjects
                    .AsNoTracking()
                    .CountAsync(up => up.UserId == u.Id);

                userDtos.Add(new UserListDto
                {
                    UserId = u.Id,
                    Email = u.Email ?? "",
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Initials = initials,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    CreatedAt = u.CreatedAt,
                    ProjectCount = projectCount
                });
            }

            var result = new TeamFlow.API.DTOs.Common.PagedResultDto<UserListDto>
            {
                Items = userDtos,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };

            return Ok(result);
        }

        /// <summary>
        /// Pobranie szczegółów użytkownika
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUser(string id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var currentUser = await _userManager.FindByIdAsync(userId);
            if (currentUser == null || !currentUser.OrganizationId.HasValue)
            {
                return BadRequest(new { error = "Użytkownik nie należy do żadnej organizacji" });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "Użytkownik nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do tej samej organizacji
            if (user.OrganizationId != currentUser.OrganizationId)
            {
                return Forbid();
            }

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

            var organizationName = user.Organization?.Name;

            var userDetailDto = new UserDetailDto
            {
                UserId = user.Id,
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                Initials = initials,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                OrganizationId = user.OrganizationId,
                OrganizationName = organizationName
            };

            return Ok(userDetailDto);
        }

        /// <summary>
        /// Aktualizacja użytkownika (tylko własny profil lub Administrator)
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
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

            var currentUser = await _userManager.FindByIdAsync(userId);
            if (currentUser == null)
            {
                return Unauthorized(new { error = "Użytkownik nie został znaleziony" });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "Użytkownik nie został znaleziony" });
            }

            // Sprawdź uprawnienia: tylko własny profil lub Administrator
            var isOwnProfile = userId == id;
            var isAdmin = currentUser.Role == UserRole.Administrator && 
                         currentUser.OrganizationId == user.OrganizationId;

            if (!isOwnProfile && !isAdmin)
            {
                return Forbid();
            }

            // Administrator może zmienić rolę, użytkownik nie może
            if (dto.Role.HasValue && !isAdmin)
            {
                return BadRequest(new { error = "Tylko Administrator może zmienić rolę" });
            }

            // Aktualizuj pola
            if (!string.IsNullOrEmpty(dto.FirstName))
            {
                user.FirstName = dto.FirstName;
            }
            if (!string.IsNullOrEmpty(dto.LastName))
            {
                user.LastName = dto.LastName;
            }
            if (dto.Role.HasValue && isAdmin)
            {
                user.Role = dto.Role.Value;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Nie udało się zaktualizować użytkownika", errors = result.Errors });
            }

            // Pobierz zaktualizowanego użytkownika
            var updatedUser = await _userManager.FindByIdAsync(id);
            var firstName = updatedUser?.FirstName ?? "";
            var lastName = updatedUser?.LastName ?? "";
            var initials = "";
            if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
            {
                initials = $"{firstName[0]}{lastName[0]}".ToUpper();
            }
            else if (!string.IsNullOrEmpty(updatedUser?.Email))
            {
                initials = updatedUser.Email[0].ToString().ToUpper();
            }

            var userDetailDto = new UserDetailDto
            {
                UserId = updatedUser!.Id,
                Email = updatedUser.Email ?? "",
                FirstName = updatedUser.FirstName,
                LastName = updatedUser.LastName,
                Initials = initials,
                Role = updatedUser.Role,
                IsActive = updatedUser.IsActive,
                CreatedAt = updatedUser.CreatedAt,
                OrganizationId = updatedUser.OrganizationId,
                OrganizationName = updatedUser.Organization?.Name
            };

            return Ok(userDetailDto);
        }

        /// <summary>
        /// Usunięcie użytkownika (tylko Administrator)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var currentUser = await _userManager.FindByIdAsync(userId);
            if (currentUser == null || currentUser.Role != UserRole.Administrator)
            {
                return Forbid();
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "Użytkownik nie został znaleziony" });
            }

            // Sprawdź czy użytkownik należy do tej samej organizacji
            if (user.OrganizationId != currentUser.OrganizationId)
            {
                return Forbid();
            }

            // Nie można usunąć samego siebie
            if (userId == id)
            {
                return BadRequest(new { error = "Nie można usunąć własnego konta" });
            }

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Nie udało się usunąć użytkownika", errors = result.Errors });
            }

            return NoContent();
        }

        /// <summary>
        /// Aktualizacja własnego profilu
        /// </summary>
        [HttpPut("me")]
        [ProducesResponseType(typeof(UserDetailDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfileDto dto)
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
                return NotFound(new { error = "Użytkownik nie został znaleziony" });
            }

            // Aktualizuj pola
            if (!string.IsNullOrEmpty(dto.FirstName))
            {
                user.FirstName = dto.FirstName;
            }
            if (!string.IsNullOrEmpty(dto.LastName))
            {
                user.LastName = dto.LastName;
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Nie udało się zaktualizować profilu", errors = result.Errors });
            }

            // Pobierz zaktualizowanego użytkownika
            var updatedUser = await _userManager.FindByIdAsync(userId);
            var firstName = updatedUser?.FirstName ?? "";
            var lastName = updatedUser?.LastName ?? "";
            var initials = "";
            if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
            {
                initials = $"{firstName[0]}{lastName[0]}".ToUpper();
            }
            else if (!string.IsNullOrEmpty(updatedUser?.Email))
            {
                initials = updatedUser.Email[0].ToString().ToUpper();
            }

            var userDetailDto = new UserDetailDto
            {
                UserId = updatedUser!.Id,
                Email = updatedUser.Email ?? "",
                FirstName = updatedUser.FirstName,
                LastName = updatedUser.LastName,
                Initials = initials,
                Role = updatedUser.Role,
                IsActive = updatedUser.IsActive,
                CreatedAt = updatedUser.CreatedAt,
                OrganizationId = updatedUser.OrganizationId,
                OrganizationName = updatedUser.Organization?.Name
            };

            return Ok(userDetailDto);
        }

        /// <summary>
        /// Zmiana hasła
        /// </summary>
        [HttpPut("me/password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
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
                return NotFound(new { error = "Użytkownik nie został znaleziony" });
            }

            // Sprawdź aktualne hasło
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.CurrentPassword);
            if (!isPasswordValid)
            {
                return BadRequest(new { error = "Aktualne hasło jest nieprawidłowe" });
            }

            // Zmień hasło
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Nie udało się zmienić hasła", errors = result.Errors });
            }

            return Ok(new { message = "Hasło zostało zmienione pomyślnie" });
        }
    }
}

