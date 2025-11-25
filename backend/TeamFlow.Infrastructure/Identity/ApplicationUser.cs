using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;
using TeamFlow.Domain.Enums;
using TeamFlow.Domain.Entities;

namespace TeamFlow.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }
        
        [MaxLength(100)]
        public string? LastName { get; set; }
        
        // FK do organizacji – może być null przed przyjęciem do organizacji
        public int? OrganizationId { get; set; }
        public Organization? Organization { get; set; }
        
        // Rola w organizacji (enum)
        public UserRole Role { get; set; } = UserRole.Member;
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Nawigacje (skonfigurowane przez Fluent API w DbContext)
    }
}

