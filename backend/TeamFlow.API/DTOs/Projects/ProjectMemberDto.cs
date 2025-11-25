namespace TeamFlow.API.DTOs.Projects
{
    public class ProjectMemberDto
    {
        public string UserId { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? Initials { get; set; }
        public string? Role { get; set; }
        public DateTime? JoinedDate { get; set; }
    }
}

