import { Outlet } from 'react-router-dom'
import { MobileSidebar, MobileSidebarTrigger } from '@/components/ui/mobile-sidebar'
import { useMobileSidebar } from '@/hooks/use-mobile-sidebar'
import { Sidebar } from './sidebar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'
import { useAuth } from '@/providers/auth-provider'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  User,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Loader2
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
  },
  {
    title: 'Courses Library',
    href: '/courses',
    icon: BookOpen,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function MobileLayout() {
  const { isOpen, close, toggle } = useMobileSidebar()
  const { theme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleAuthAction = async () => {
    if (user) {
      try {
        await signOut()
        navigate('/')
        close()
      } catch (error) {
        console.error('Error signing out:', error)
      }
    } else {
      navigate('/login')
      close()
    }
  }

  const handleNavigation = (href: string) => {
    navigate(href)
    close()
  }

  const isLoggedIn = !!user

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <MobileSidebarTrigger onClick={toggle} />
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="font-bold text-lg text-foreground">
                Orion Path
              </span>
            </Link>
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        onToggle={toggle}
        onClose={close}
        width="85%"
      >
        <div className="space-y-6">
          {/* Auth Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                loading ? "bg-yellow-500" : isLoggedIn ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-muted-foreground truncate">
                {loading 
                  ? 'Loading...' 
                  : isLoggedIn 
                    ? user.email || 'Authenticated' 
                    : 'Not signed in'
                }
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href
              const isProfileRoute = item.href === '/profile'
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    'w-full justify-start space-x-3 h-12',
                    isProfileRoute && !isLoggedIn && 'opacity-50'
                  )}
                  onClick={() => {
                    if (isProfileRoute && !isLoggedIn) {
                      handleNavigation('/login')
                    } else {
                      handleNavigation(item.href)
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Button>
              )
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 h-12"
              onClick={toggleTheme}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </Button>
          </div>

          {/* Auth Action */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 h-12"
              onClick={handleAuthAction}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isLoggedIn ? (
                <LogOut className="h-5 w-5" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              <span>
                {loading 
                  ? 'Loading...' 
                  : isLoggedIn 
                    ? 'Sign Out' 
                    : 'Sign In'
                }
              </span>
            </Button>
          </div>
        </div>
      </MobileSidebar>

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-y-auto",
        "md:ml-16", // Desktop margin for sidebar
        "pt-16 md:pt-0" // Mobile top padding for header
      )}>
        <Outlet />
      </main>
    </div>
  )
}