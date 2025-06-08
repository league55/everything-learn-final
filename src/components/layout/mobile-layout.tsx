import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function MobileLayout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Universal Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:ml-16">
        <Outlet />
      </main>
    </div>
  )
}