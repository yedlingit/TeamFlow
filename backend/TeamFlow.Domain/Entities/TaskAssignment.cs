using System;
using System.ComponentModel.DataAnnotations;

namespace TeamFlow.Domain.Entities
{
    public class TaskAssignment
    {
        // Klucz złożony (TaskId + UserId) skonfigurowany w DbContext
        public int TaskId { get; set; }
        public Task Task { get; set; } = null!;
        
        public string UserId { get; set; } = string.Empty;
        
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}

