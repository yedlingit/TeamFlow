using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Organizations
{
    public class JoinOrganizationDto
    {
        [Required(ErrorMessage = "Kod zaproszenia jest wymagany")]
        [MaxLength(20, ErrorMessage = "Kod zaproszenia nie może przekraczać 20 znaków")]
        public string InvitationCode { get; set; } = string.Empty;
    }
}

