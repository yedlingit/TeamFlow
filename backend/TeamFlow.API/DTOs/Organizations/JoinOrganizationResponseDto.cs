namespace TeamFlow.API.DTOs.Organizations
{
    public class JoinOrganizationResponseDto
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; } = string.Empty;
        public string Message { get; set; } = "Successfully joined organization";
    }
}

