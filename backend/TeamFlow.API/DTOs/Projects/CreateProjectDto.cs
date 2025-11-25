using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Projects
{
    public class CreateProjectDto
    {
        [Required(ErrorMessage = "Nazwa projektu jest wymagana")]
        [MaxLength(200, ErrorMessage = "Nazwa projektu nie może przekraczać 200 znaków")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? TeamLeaderId { get; set; }

        [MaxLength(7, ErrorMessage = "Kolor motywu musi być w formacie HEX (max 7 znaków)")]
        public string? Theme { get; set; }

        public DateTime? DueDate { get; set; }

        public List<string>? MemberIds { get; set; }
    }
}

