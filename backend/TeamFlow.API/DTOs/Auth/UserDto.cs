using TeamFlow.Domain.Enums;

namespace TeamFlow.API.DTOs.Auth
{
    public class UserDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public int? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
    }
}

