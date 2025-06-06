import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'

export function MainLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-16 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}