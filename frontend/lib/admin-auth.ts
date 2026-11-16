export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export const AUTHORIZED_ADMINS: Record<string, AdminUser> = {
  'supunhasaranga5@gmail.com': {
    email: 'supunhasaranga5@gmail.com',
    name: 'Supun Hasaranga',
    role: 'Wedding Organizer & Groom Side Admin',
  },
  'gvirajanirajapaksha@gmail.com': {
    email: 'gvirajanirajapaksha@gmail.com',
    name: 'Virajani Rajapaksha',
    role: 'Wedding Organizer & Bride Side Admin',
  },
};

export function isAuthorizedAdmin(email: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return Boolean(AUTHORIZED_ADMINS[clean]);
}

export function getAdminUser(email: string): AdminUser | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return AUTHORIZED_ADMINS[clean] || null;
}
