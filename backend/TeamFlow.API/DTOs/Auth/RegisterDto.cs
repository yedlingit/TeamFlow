using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Auth
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Imię jest wymagane")]
        [MaxLength(100, ErrorMessage = "Imię nie może przekraczać 100 znaków")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nazwisko jest wymagane")]
        [MaxLength(100, ErrorMessage = "Nazwisko nie może przekraczać 100 znaków")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email jest wymagany")]
        [EmailAddress(ErrorMessage = "Nieprawidłowy format email")]
        [MaxLength(256, ErrorMessage = "Email nie może przekraczać 256 znaków")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Hasło jest wymagane")]
        [MinLength(6, ErrorMessage = "Hasło musi mieć co najmniej 6 znaków")]
        [MaxLength(100, ErrorMessage = "Hasło nie może przekraczać 100 znaków")]
        public string Password { get; set; } = string.Empty;
    }
}

