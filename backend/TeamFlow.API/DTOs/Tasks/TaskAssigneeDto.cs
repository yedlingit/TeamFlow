namespace TeamFlow.API.DTOs.Tasks
{
    public class TaskAssigneeDto
    {
        public string UserId { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Initials { get; set; }
        public DateTime? AssignedAt { get; set; }
    }
}

