using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TeamFlow.Domain.Entities
{
    public class Organization
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required, MaxLength(20)]
        public string InvitationCode { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Nawigacje
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}

