using System.ComponentModel.DataAnnotations;
using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;

namespace TeamFlow.API.DTOs.Tasks
{
    public class UpdateTaskStatusDto
    {
        [Required(ErrorMessage = "Status jest wymagany")]
        public TaskStatusEnum Status { get; set; }
    }
}

