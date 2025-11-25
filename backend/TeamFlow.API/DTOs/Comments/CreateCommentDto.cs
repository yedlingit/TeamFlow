using System.ComponentModel.DataAnnotations;

namespace TeamFlow.API.DTOs.Comments
{
    public class CreateCommentDto
    {
        [Required(ErrorMessage = "Treść komentarza jest wymagana")]
        public string Content { get; set; } = string.Empty;
    }
}

