/**
 * Utility to map role from number to string
 * Backend may return role as number (0, 1, 2) or string ('Member', 'TeamLeader', 'Administrator')
 */
export function mapRoleToString(role: number | string): 'Member' | 'TeamLeader' | 'Administrator' {
  if (typeof role === 'string') {
    // Already a string, validate and return
    if (role === 'Member' || role === 'TeamLeader' || role === 'Administrator') {
      return role;
    }
    // Fallback to Member if invalid string
    return 'Member';
  }
  
  // Map number to string
  switch (role) {
    case 0:
      return 'Member';
    case 1:
      return 'TeamLeader';
    case 2:
      return 'Administrator';
    default:
      return 'Member';
  }
}

/**
 * Map role string to number (for API requests)
 */
export function mapRoleToNumber(role: 'Member' | 'TeamLeader' | 'Administrator'): number {
  switch (role) {
    case 'Member':
      return 0;
    case 'TeamLeader':
      return 1;
    case 'Administrator':
      return 2;
    default:
      return 0;
  }
}

