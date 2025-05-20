import { useUser } from './useUser'

// Mapping role -> permission code (theo dữ liệu mẫu)
const rolePermissionMap: Record<string, string[]> = {
  super_admin: [
    // Contacts permissions
    'VIEW_CONTACTS', 'EDIT_CONTACTS', 'DELETE_CONTACTS', 'IMPORT_CONTACTS', 'EXPORT_CONTACTS',
    // Accounts permissions
    'VIEW_ACCOUNTS', 'CREATE_ACCOUNTS', 'EDIT_ACCOUNTS', 'DELETE_ACCOUNTS',
    // Roles permissions
    'VIEW_ROLES', 'CREATE_ROLES', 'EDIT_ROLES', 'DELETE_ROLES', 'ASSIGN_ROLES',
    // System permissions
    'VIEW_LOGS', 'MANAGE_SYSTEM'
  ],
  data_entry: [
    // Contacts permissions
    'VIEW_CONTACTS', 'EDIT_CONTACTS', 'IMPORT_CONTACTS', 'EXPORT_CONTACTS'
  ],
  auditor: [
    // View-only permissions
    'VIEW_CONTACTS', 'VIEW_ACCOUNTS', 'VIEW_ROLES', 'VIEW_LOGS'
  ],
  officer_account_manager: [
    // Account management permissions
    'VIEW_ACCOUNTS', 'CREATE_ACCOUNTS', 'EDIT_ACCOUNTS',
    // Role management permissions
    'VIEW_ROLES', 'ASSIGN_ROLES',
    // Basic contact permissions
    'VIEW_CONTACTS'
  ]
}

export const usePermission = () => {
  const user = useUser()
  
  const hasPermission = (code: string) => {
    if (!user) return false
    const role = user.role
    return rolePermissionMap[role]?.includes(code) || false
  }

  return { hasPermission }
} 