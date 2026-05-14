import { Outlet } from 'react-router-dom'
import { DashboardShell } from '@/components/DashboardShell'

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  )
}
