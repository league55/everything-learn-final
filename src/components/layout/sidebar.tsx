import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'
import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  Award,
  User,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Loader2,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  className?: string
}

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
    title: 'Certificates',
    href: '/certificates',
    icon: Award,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleAuthAction = async () => {
    if (user) {
      // Sign out
      setIsAuthLoading(true)
      try {
        await signOut()
        navigate('/')
        setIsOpen(false)
      } catch (error) {
        console.error('Error signing out:', error)
      } finally {
        setIsAuthLoading(false)
      }
    } else {
      // Navigate to login
      navigate('/login')
      setIsOpen(false)
    }
  }

  const handleNavigation = (href: string) => {
    navigate(href)
    setIsOpen(false)
    setIsDesktopExpanded(false)
  }

  const isLoggedIn = !!user

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar')
      const trigger = document.getElementById('mobile-sidebar-trigger')
      
      if (isOpen && sidebar && trigger && 
          !sidebar.contains(event.target as Node) && 
          !trigger.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div 
          className={cn(
            "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
            isDesktopExpanded ? "w-80" : "w-16"
          )}
          onMouseEnter={() => setIsDesktopExpanded(true)}
          onMouseLeave={() => setIsDesktopExpanded(false)}
        >
          <div className="flex h-full flex-col">
            {/* Desktop Header */}
            <div className="flex h-16 items-center border-b border-border px-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              {isDesktopExpanded && (
                <Link to="/" className="flex items-center space-x-2 ml-3" onClick={() => setIsDesktopExpanded(false)}>
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-sm">O</span>
                  </div>
                  <span className="font-bold text-lg text-foreground">
                    Orion Path
                  </span>
                </Link>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="flex-1 space-y-2 p-4">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const isProfileRoute = item.href === '/profile'
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      'w-full justify-start h-12',
                      isDesktopExpanded ? 'space-x-3' : 'px-3',
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
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {isDesktopExpanded && <span>{item.title}</span>}
                  </Button>
                )
              })}
            </nav>

            {/* Desktop Bottom controls */}
            <div className="border-t border-border p-4 space-y-2">
              {/* Desktop Auth Status */}
              {isDesktopExpanded && (
                <div className="px-4 py-3 border-b border-border/50">
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
              )}
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12",
                  isDesktopExpanded ? 'space-x-3' : 'px-3'
                )}
                onClick={toggleTheme}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <Sun className="h-5 w-5 flex-shrink-0" />
                )}
                {isDesktopExpanded && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
              </Button>

              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12",
                  isDesktopExpanded ? 'space-x-3' : 'px-3'
                )}
                onClick={handleAuthAction}
                disabled={loading || isAuthLoading}
              >
                {loading || isAuthLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                ) : isLoggedIn ? (
                  <LogOut className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <LogIn className="h-5 w-5 flex-shrink-0" />
                )}
                {isDesktopExpanded && (
                  <span>
                    {loading || isAuthLoading
                      ? 'Loading...' 
                      : isLoggedIn 
                        ? 'Sign Out' 
                        : 'Sign In'
                    }
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar (unchanged) */}
      <div className="md:hidden">
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          id="mobile-sidebar"
          className={cn(
            'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-transform duration-300 ease-in-out w-80',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Mobile Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">O</span>
                </div>
                <span className="font-bold text-lg text-foreground">
                  Orion Path
                </span>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Auth Status */}
            <div className="px-4 py-3 border-b border-border/50">
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

            {/* Mobile Navigation */}
            <nav className="flex-1 space-y-2 p-4">
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

            {/* Mobile Bottom controls */}
            <div className="border-t border-border p-4 space-y-2">
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

              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 h-12"
                onClick={handleAuthAction}
                disabled={loading || isAuthLoading}
              >
                {loading || isAuthLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isLoggedIn ? (
                  <LogOut className="h-5 w-5" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                <span>
                  {loading || isAuthLoading
                    ? 'Loading...' 
                    : isLoggedIn 
                      ? 'Sign Out' 
                      : 'Sign In'
                  }
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Trigger */}
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-sm border-t border-border">
          <div className="flex items-center justify-center p-4">
            <Button
              id="mobile-sidebar-trigger"
              variant="default"
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center gap-1"
            >
              {/* Custom Hamburger Icon */}
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
                <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
                <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}