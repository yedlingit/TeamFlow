using TeamFlow.Domain.Enums;
using TaskStatusEnum = TeamFlow.Domain.Enums.TaskStatus;

namespace TeamFlow.API.DTOs.Tasks
{
    public class TaskDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public TaskStatusEnum Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<TaskAssigneeDto>? Assignees { get; set; }
        public int CommentCount { get; set; }
    }
}

