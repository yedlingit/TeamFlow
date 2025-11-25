using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TeamFlow.API.DTOs.Auth;
using TeamFlow.Domain.Enums;
using TeamFlow.Infrastructure.Data;
using TeamFlow.Infrastructure.Identity;

namespace TeamFlow.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ApplicationDbContext context,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Rejestracja nowego użytkownika
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(typeof(RegisterResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Sprawdź czy użytkownik już istnieje
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                return BadRequest(new { error = "Użytkownik z tym adresem email już istnieje" });
            }

            // Utwórz nowego użytkownika
            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Role = UserRole.Member,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                _logger.LogWarning("Registration failed for {Email}: {Errors}", dto.Email, string.Join(", ", errors));
                return BadRequest(new { error = "Rejestracja nie powiodła się", errors = errors });
            }

            _logger.LogInformation("User registered successfully: {Email}", dto.Email);

            return CreatedAtAction(nameof(Register), new RegisterResponseDto
            {
                UserId = user.Id,
                Email = user.Email,
                Message = "Registration successful"
            });
        }

        /// <summary>
        /// Logowanie użytkownika
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("Login attempt failed: User not found or inactive - {Email}", dto.Email);
                return Unauthorized(new { error = "Nieprawidłowy adres email lub hasło" });
            }

            var result = await _signInManager.PasswordSignInAsync(
                user.UserName!,
                dto.Password,
                isPersistent: true,
                lockoutOnFailure: false);

            if (!result.Succeeded)
            {
                _logger.LogWarning("Login attempt failed: Invalid password - {Email}", dto.Email);
                return Unauthorized(new { error = "Nieprawidłowy adres email lub hasło" });
            }

            _logger.LogInformation("User logged in successfully: {Email}", dto.Email);

            var userDto = new UserDto
            {
                UserId = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                Role = user.Role,
                IsActive = user.IsActive
            };

            return Ok(userDto);
        }

        /// <summary>
        /// Wylogowanie użytkownika
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Logout()
        {
            var userId = _userManager.GetUserId(User);
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out: {UserId}", userId);
            return Ok(new { message = "Wylogowano pomyślnie" });
        }

        /// <summary>
        /// Pobranie danych zalogowanego użytkownika
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetMe()
        {
            // Pobierz UserId z claims
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

            // Załaduj organizację jeśli istnieje
            if (user.OrganizationId.HasValue)
            {
                var organization = await _context.Organizations.FindAsync(user.OrganizationId.Value);
                if (organization != null)
                {
                    user.Organization = organization;
                }
            }

            var userDto = new UserDto
            {
                UserId = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                OrganizationId = user.OrganizationId,
                OrganizationName = user.Organization?.Name,
                Role = user.Role,
                IsActive = user.IsActive
            };

            return Ok(userDto);
        }
    }
}

