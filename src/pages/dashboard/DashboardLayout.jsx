import { Outlet } from 'react-router-dom'
import { SyncStatus } from '@/components/SyncStatus'
import { DashboardShell } from '@/components/DashboardShell'

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <SyncStatus />
      <Outlet />
    </DashboardShell>
  )
}
