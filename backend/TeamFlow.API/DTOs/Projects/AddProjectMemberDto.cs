using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Projects
{
    public class AddProjectMemberDto
    {
        [Required(ErrorMessage = "ID użytkownika jest wymagane")]
        public string UserId { get; set; } = string.Empty;

        public string? Role { get; set; }
    }
}

