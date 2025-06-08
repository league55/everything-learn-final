import { Outlet } from 'react-router-dom'
import { ResponsiveSidebar } from './responsive-sidebar'

export function MobileLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Responsive Sidebar */}
      <ResponsiveSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}