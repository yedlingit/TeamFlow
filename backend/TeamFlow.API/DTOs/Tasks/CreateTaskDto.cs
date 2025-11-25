using System.ComponentModel.DataAnnotations;
using TeamFlow.Domain.Enums;

namespace TeamFlow.API.DTOs.Tasks
{
    public class CreateTaskDto
    {
        [Required(ErrorMessage = "Tytuł zadania jest wymagany")]
        [MaxLength(200, ErrorMessage = "Tytuł zadania nie może przekraczać 200 znaków")]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "ID projektu jest wymagane")]
        public int ProjectId { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Medium;

        public DateTime? DueDate { get; set; }

        public List<string>? AssigneeIds { get; set; }
    }
}

