import { RoleGuard } from '@/components/RoleGuard'

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Admin Panel</h1>
        <p>Only admins can see this!</p>
        <ul>
          <li>User Management</li>
          <li>System Settings</li>
          <li>Reports & Analytics</li>
        </ul>
      </div>
    </RoleGuard>
  )
}
