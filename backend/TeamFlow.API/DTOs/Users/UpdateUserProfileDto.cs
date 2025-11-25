using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Users
{
    public class UpdateUserProfileDto
    {
        [MaxLength(100, ErrorMessage = "Imię nie może przekraczać 100 znaków")]
        public string? FirstName { get; set; }

        [MaxLength(100, ErrorMessage = "Nazwisko nie może przekraczać 100 znaków")]
        public string? LastName { get; set; }
    }
}

