import { UserAccount, UserRole } from '../../types/erp';
import { getDefaultPermissionsForRole } from '../../data/mockUsers';

/** Converts the user object returned by the FastAPI backend into the app's UserAccount shape. */
export const toUserAccount = (u: any): UserAccount => {
  const role: UserRole = (u.role as UserRole) || 'Employee';
  const name: string = u.employee_name || u.employee?.full_name || u.username;
  return {
    id: `USR-${u.id}`,
    username: u.username,
    name,
    email: u.email,
    phone: u.employee?.phone || '',
    role,
    department: u.department || u.employee?.department || 'Operations',
    status: u.is_active ? 'ACTIVE' : 'INACTIVE',
    avatar: name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    createdAt: u.created_at || new Date().toISOString().split('T')[0],
    lastLogin: 'Just now',
    permissions: getDefaultPermissionsForRole(role),
    employee_id: u.employee_id || u.employee?.employee_id,
    employee_name: u.employee_name || u.employee?.full_name,
    employee_status: u.employee_status || u.employee?.employment_status || 'Active',
  };
};
