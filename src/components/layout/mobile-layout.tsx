import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { BoltBadge } from '@/components/landing/bolt-badge'

export function MobileLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Bolt Badge */}
      <BoltBadge />

      {/* Universal Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-16">
        <Outlet />
      </main>
    </div>
  )
}