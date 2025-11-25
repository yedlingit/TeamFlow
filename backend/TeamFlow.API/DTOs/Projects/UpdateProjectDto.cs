using System.ComponentModel.DataAnnotations;
using TeamFlow.Domain.Enums;

namespace TeamFlow.API.DTOs.Projects
{
    public class UpdateProjectDto
    {
        [MaxLength(200, ErrorMessage = "Nazwa projektu nie może przekraczać 200 znaków")]
        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? TeamLeaderId { get; set; }

        public ProjectStatus? Status { get; set; }

        [MaxLength(7, ErrorMessage = "Kolor motywu musi być w formacie HEX (max 7 znaków)")]
        public string? Theme { get; set; }

        public DateTime? DueDate { get; set; }

        public List<string>? MemberIds { get; set; }
    }
}

