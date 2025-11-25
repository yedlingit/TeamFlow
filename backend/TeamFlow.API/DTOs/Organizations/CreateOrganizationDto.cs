using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Organizations
{
    public class CreateOrganizationDto
    {
        [Required(ErrorMessage = "Nazwa organizacji jest wymagana")]
        [MaxLength(200, ErrorMessage = "Nazwa organizacji nie może przekraczać 200 znaków")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Opis nie może przekraczać 1000 znaków")]
        public string? Description { get; set; }
    }
}

