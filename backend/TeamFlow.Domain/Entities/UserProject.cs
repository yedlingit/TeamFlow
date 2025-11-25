using System;
using System.ComponentModel.DataAnnotations;

namespace TeamFlow.Domain.Entities
{
    public class UserProject
    {
        // Composite PK (UserId + ProjectId) zostanie skonfigurowane w DbContext
        public string UserId { get; set; } = string.Empty;
        
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        
        public DateTime JoinedDate { get; set; } = DateTime.UtcNow;
        
        // Opcjonalna rola w projekcie (np. "Team Leader", "Member")
        [MaxLength(100)]
        public string? Role { get; set; }
    }
}

