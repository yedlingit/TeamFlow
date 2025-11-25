using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;

namespace TeamFlow.API.DTOs.Tasks
{
    public class UpdateTaskDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public TaskStatusEnum? Status { get; set; }

        public TaskPriority? Priority { get; set; }

        public DateTime? DueDate { get; set; }
    }
}

