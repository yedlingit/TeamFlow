using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TeamFlow.Domain.Enums;

namespace TeamFlow.Domain.Entities
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        // FK → Organization (required)
        public int OrganizationId { get; set; }
        public Organization Organization { get; set; } = null!;
        
        // Opcjonalny lider projektu (FK → AspNetUsers)
        public string? TeamLeaderId { get; set; }
        
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        
        // HEX‑owy kolor motywu, np. "#3B82F6"
        [MaxLength(7)]
        public string? Theme { get; set; }
        
        public DateTime? DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Nawigacje many‑to‑many i one‑to‑many
        public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
        public ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}

