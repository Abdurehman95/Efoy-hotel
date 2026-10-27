/**
 * User Identity and Role Utility Helpers for Efoy Hotel & Suites
 * Resolves authenticated user display name, avatar initials, and formal hospitality role title.
 */

export const getUserDisplayName = (user) => {
  if (user?.name && typeof user.name === 'string' && user.name.trim().length > 0) {
    return user.name.trim();
  }
  if (user?.email && typeof user.email === 'string') {
    const prefix = user.email.split('@')[0];
    if (prefix) {
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
  }
  return 'Authenticated User';
};

export const getUserInitials = (user) => {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const getUserRoleLabel = (role) => {
  if (!role) return 'Staff Member';
  const normalized = role.toLowerCase().trim();
  const map = {
    admin: 'System Administrator',
    receptionist: 'Front Desk Officer',
    kitchen: 'Culinary Department',
    housekeeping: 'Housekeeping Specialist',
    guest: 'Valued Guest Member',
  };
  return map[normalized] || 'Staff Member';
};

export default {
  getUserDisplayName,
  getUserInitials,
  getUserRoleLabel,
};
