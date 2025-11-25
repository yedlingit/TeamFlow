using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Users
{
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Aktualne hasło jest wymagane")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Nowe hasło jest wymagane")]
        [MinLength(6, ErrorMessage = "Hasło musi mieć co najmniej 6 znaków")]
        public string NewPassword { get; set; } = string.Empty;
    }
}

