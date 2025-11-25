using TeamFlow.Domain.Enums;

namespace TeamFlow.API.DTOs.Projects
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int OrganizationId { get; set; }
        public string? TeamLeaderId { get; set; }
        public string? TeamLeaderName { get; set; }
        public ProjectStatus Status { get; set; }
        public string? Theme { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Progress { get; set; }
        public int TaskCount { get; set; }
        public int MemberCount { get; set; }
        public List<ProjectMemberDto>? Members { get; set; }
    }
}

