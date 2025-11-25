using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using TeamFlow.API.DTOs.Organizations;
using TeamFlow.Domain.Enums;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrganizationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<OrganizationsController> _logger;

        public OrganizationsController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            ILogger<OrganizationsController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        /// <summary>
        /// Utworzenie nowej organizacji (właściciel staje się Administratorem)
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrganization([FromBody] CreateOrganizationDto dto)
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

            // Sprawdź czy użytkownik już należy do organizacji
            if (user.OrganizationId.HasValue)
            {
                return BadRequest(new { error = "Użytkownik już należy do organizacji" });
            }

            // Generuj unikalny kod zaproszenia
            var invitationCode = await GenerateUniqueInvitationCodeAsync();

            // Utwórz organizację
            var organization = new Domain.Entities.Organization
            {
                Name = dto.Name,
                Description = dto.Description,
                InvitationCode = invitationCode,
                CreatedAt = DateTime.UtcNow
            };

            _context.Organizations.Add(organization);
            await _context.SaveChangesAsync();

            // Przypisz użytkownika do organizacji jako Administrator
            user.OrganizationId = organization.Id;
            user.Role = UserRole.Administrator;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Organization created: {OrganizationId} by user: {UserId}", organization.Id, userId);

            var organizationDto = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Description = organization.Description,
                InvitationCode = organization.InvitationCode,
                CreatedAt = organization.CreatedAt
            };

            return CreatedAtAction(nameof(GetOrganization), new { id = organization.Id }, organizationDto);
        }

        /// <summary>
        /// Dołączenie do organizacji przez kod zaproszenia
        /// </summary>
        [HttpPost("join")]
        [ProducesResponseType(typeof(JoinOrganizationResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> JoinOrganization([FromBody] JoinOrganizationDto dto)
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

            // Sprawdź czy użytkownik już należy do organizacji
            if (user.OrganizationId.HasValue)
            {
                return BadRequest(new { error = "Użytkownik już należy do organizacji" });
            }

            // Znajdź organizację po kodzie zaproszenia
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.InvitationCode == dto.InvitationCode);

            if (organization == null)
            {
                return NotFound(new { error = "Nieprawidłowy kod zaproszenia" });
            }

            // Przypisz użytkownika do organizacji jako Member
            user.OrganizationId = organization.Id;
            user.Role = UserRole.Member;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} joined organization {OrganizationId}", userId, organization.Id);

            var response = new JoinOrganizationResponseDto
            {
                OrganizationId = organization.Id,
                OrganizationName = organization.Name,
                Message = "Successfully joined organization"
            };

            return Ok(response);
        }

        /// <summary>
        /// Pobranie organizacji użytkownika
        /// </summary>
        [HttpGet("current")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCurrentOrganization()
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || !user.OrganizationId.HasValue)
            {
                return NotFound(new { error = "Użytkownik nie należy do żadnej organizacji" });
            }

            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == user.OrganizationId.Value);

            if (organization == null)
            {
                return NotFound(new { error = "Organizacja nie została znaleziona" });
            }

            // Policz członków i projekty
            var memberCount = await _context.Users
                .CountAsync(u => u.OrganizationId == organization.Id);

            var projectCount = await _context.Projects
                .CountAsync(p => p.OrganizationId == organization.Id);

            var organizationDto = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Description = organization.Description,
                InvitationCode = organization.InvitationCode,
                CreatedAt = organization.CreatedAt,
                MemberCount = memberCount,
                ProjectCount = projectCount
            };

            return Ok(organizationDto);
        }

        /// <summary>
        /// Pobranie szczegółów organizacji
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetOrganization(int id)
        {
            var userId = _userManager.GetUserId(User);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { error = "Użytkownik nie jest zalogowany" });
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || !user.OrganizationId.HasValue)
            {
                return Forbid("Użytkownik nie należy do żadnej organizacji");
            }

            // Sprawdź czy użytkownik należy do tej samej organizacji
            if (user.OrganizationId.Value != id)
            {
                return Forbid("Brak dostępu do tej organizacji");
            }

            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == id);

            if (organization == null)
            {
                return NotFound(new { error = "Organizacja nie została znaleziona" });
            }

            // Policz członków i projekty
            var memberCount = await _context.Users
                .CountAsync(u => u.OrganizationId == organization.Id);

            var projectCount = await _context.Projects
                .CountAsync(p => p.OrganizationId == organization.Id);

            var organizationDto = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Description = organization.Description,
                InvitationCode = organization.InvitationCode,
                CreatedAt = organization.CreatedAt,
                MemberCount = memberCount,
                ProjectCount = projectCount
            };

            return Ok(organizationDto);
        }

        /// <summary>
        /// Aktualizacja organizacji (tylko Administrator)
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(OrganizationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateOrganization(int id, [FromBody] UpdateOrganizationDto dto)
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

            // Sprawdź uprawnienia (tylko Administrator)
            if (user.Role != UserRole.Administrator || user.OrganizationId != id)
            {
                return Forbid("Tylko Administrator organizacji może aktualizować dane organizacji");
            }

            var organization = await _context.Organizations.FindAsync(id);
            if (organization == null)
            {
                return NotFound(new { error = "Organizacja nie została znaleziona" });
            }

            organization.Name = dto.Name;
            organization.Description = dto.Description;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Organization {OrganizationId} updated by user {UserId}", id, userId);

            var organizationDto = new OrganizationDto
            {
                Id = organization.Id,
                Name = organization.Name,
                Description = organization.Description,
                InvitationCode = organization.InvitationCode,
                CreatedAt = organization.CreatedAt
            };

            return Ok(organizationDto);
        }

        /// <summary>
        /// Usunięcie organizacji (tylko Administrator)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOrganization(int id)
        {
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

            // Sprawdź uprawnienia (tylko Administrator)
            if (user.Role != UserRole.Administrator || user.OrganizationId != id)
            {
                return Forbid("Tylko Administrator organizacji może usunąć organizację");
            }

            var organization = await _context.Organizations.FindAsync(id);
            if (organization == null)
            {
                return NotFound(new { error = "Organizacja nie została znaleziona" });
            }

            _context.Organizations.Remove(organization);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Organization {OrganizationId} deleted by user {UserId}", id, userId);

            return NoContent();
        }

        /// <summary>
        /// Generuje unikalny kod zaproszenia
        /// </summary>
        private async Task<string> GenerateUniqueInvitationCodeAsync()
        {
            string code;
            bool isUnique;
            const int maxAttempts = 10;

            int attempts = 0;
            do
            {
                // Generuj kod w formacie TF-{PREFIX}-{NUMBERS}
                code = GenerateRandomCode(0); // length nie jest używany w nowym formacie
                isUnique = !await _context.Organizations
                    .AnyAsync(o => o.InvitationCode == code);
                attempts++;
            } while (!isUnique && attempts < maxAttempts);

            if (!isUnique)
            {
                throw new InvalidOperationException("Nie udało się wygenerować unikalnego kodu zaproszenia");
            }

            return code;
        }

        /// <summary>
        /// Generuje kod zaproszenia w formacie TF-{PREFIX}-{NUMBERS}
        /// </summary>
        private string GenerateRandomCode(int length)
        {
            // Generuj 3-znakowy prefix (litery)
            const string prefixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var random = new Random();
            var prefix = new string(Enumerable.Range(0, 3)
                .Select(_ => prefixChars[random.Next(prefixChars.Length)])
                .ToArray());

            // Generuj 4-cyfrowy numer
            var numbers = random.Next(1000, 9999).ToString();

            return $"TF-{prefix}-{numbers}";
        }
    }
}

