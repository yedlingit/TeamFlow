using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Tasks
{
    public class AddTaskAssigneeDto
    {
        [Required(ErrorMessage = "ID użytkownika jest wymagane")]
        public string UserId { get; set; } = string.Empty;
    }
}

