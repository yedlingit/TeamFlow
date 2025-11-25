using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TeamFlow.Domain.Enums;

namespace TeamFlow.Domain.Entities
{
    public class Task
    {
        [Key]
        public int Id { get; set; }
        
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        // FK → Project (required)
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        
        public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.ToDo;
        
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        public DateTime? DueDate { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        // Nawigacje many‑to‑many i one‑to‑many
        public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    }
}

