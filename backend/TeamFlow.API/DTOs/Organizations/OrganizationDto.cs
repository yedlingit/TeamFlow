namespace TeamFlow.API.DTOs.Organizations
{
    public class OrganizationDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string InvitationCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? MemberCount { get; set; }
        public int? ProjectCount { get; set; }
    }
}

