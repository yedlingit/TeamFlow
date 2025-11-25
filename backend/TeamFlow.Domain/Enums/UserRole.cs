using System.ComponentModel;

namespace TeamFlow.Domain.Enums
{
    /// <summary>
    /// Role użytkownika w organizacji.
    /// </summary>
    public enum UserRole
    {
        Member = 0,        // Zwykły członek
        TeamLeader = 1,    // Lider projektu
        Administrator = 2  // Administrator organizacji
    }
}

