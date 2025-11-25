using System;
using System.ComponentModel.DataAnnotations;

namespace TeamFlow.Domain.Entities
{
    public class Comment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        // FK → Task (required)
        public int TaskId { get; set; }
        
        // FK → Author (AspNetUsers)
        public string AuthorId { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

