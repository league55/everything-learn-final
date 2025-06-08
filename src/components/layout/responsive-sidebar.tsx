import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/providers/theme-provider'
import { useAuth } from '@/providers/auth-provider'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  User,
  Moon,
  Sun,
  LogIn,
  LogOut,
  Loader2,
  X,
  ChevronRight
} from 'lucide-react'

interface NavigationItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiresAuth?: boolean
}

interface ResponsiveSidebarProps {
  className?: string
  navigationItems?: NavigationItem[]
}

const defaultNavigationItems: NavigationItem[] = [
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
    requiresAuth: true,
  },
]

type SidebarState = 'hidden' | 'collapsed' | 'expanded' | 'overlay'

export function ResponsiveSidebar({ 
  className, 
  navigationItems = defaultNavigationItems 
}: ResponsiveSidebarProps) {
  const [sidebarState, setSidebarState] = useState<SidebarState>('hidden')
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const sidebarRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Determine initial sidebar state based on screen size
  useEffect(() => {
    const updateSidebarState = () => {
      const width = window.innerWidth
      if (width >= 1024) {
        setSidebarState('expanded') // Desktop: full sidebar
      } else if (width >= 768) {
        setSidebarState('collapsed') // Tablet: icon-only sidebar
      } else {
        setSidebarState('hidden') // Mobile: hidden by default
      }
    }

    updateSidebarState()
    setIsMounted(true)

    const handleResize = () => {
      updateSidebarState()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle click outside for mobile overlay
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarState === 'overlay' &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarState('hidden')
      }
    }

    if (sidebarState === 'overlay') {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [sidebarState])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarState === 'overlay') {
        setSidebarState('hidden')
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [sidebarState])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const handleAuthAction = async () => {
    if (user) {
      setIsAuthLoading(true)
      try {
        await signOut()
        navigate('/')
        if (window.innerWidth < 768) setSidebarState('hidden')
      } catch (error) {
        console.error('Error signing out:', error)
      } finally {
        setIsAuthLoading(false)
      }
    } else {
      navigate('/login')
      if (window.innerWidth < 768) setSidebarState('hidden')
    }
  }

  const handleNavigation = (href: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      navigate('/login')
    } else {
      navigate(href)
    }
    
    if (window.innerWidth < 768) {
      setSidebarState('hidden')
    }
  }

  const toggleMobileSidebar = () => {
    if (window.innerWidth < 768) {
      setSidebarState(sidebarState === 'overlay' ? 'hidden' : 'overlay')
    }
  }

  const toggleTabletSidebar = () => {
    if (window.innerWidth >= 768 && window.innerWidth < 1024) {
      setSidebarState(sidebarState === 'expanded' ? 'collapsed' : 'expanded')
    }
  }

  const isLoggedIn = !!user

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return null
  }

  const sidebarWidth = {
    hidden: 'w-0',
    collapsed: 'w-20',
    expanded: 'w-72',
    overlay: 'w-[80vw] max-w-sm'
  }

  const isOverlay = sidebarState === 'overlay'
  const isCollapsed = sidebarState === 'collapsed'
  const isExpanded = sidebarState === 'expanded' || sidebarState === 'overlay'

  return (
    <>
      {/* Mobile Hamburger Trigger */}
      <div className="lg:hidden fixed bottom-6 left-6 z-50">
        <Button
          onClick={toggleMobileSidebar}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-center justify-center gap-1"
          aria-label="Toggle navigation menu"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
            <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
            <div className="w-5 h-0.5 bg-primary-foreground rounded-full transition-all duration-200" />
          </div>
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden"
          onClick={() => setSidebarState('hidden')}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
          sidebarWidth[sidebarState],
          sidebarState === 'hidden' && 'lg:relative lg:translate-x-0',
          isOverlay ? 'translate-x-0' : sidebarState === 'hidden' ? '-translate-x-full lg:translate-x-0' : 'translate-x-0',
          'lg:relative lg:z-auto',
          className
        )}
        aria-label="Navigation sidebar"
        role="navigation"
      >
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header */}
          <div className={cn(
            'flex items-center border-b border-border transition-all duration-300',
            isCollapsed ? 'h-20 justify-center px-2' : 'h-16 justify-between px-4'
          )}>
            {isExpanded && (
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                onClick={() => handleNavigation('/')}
              >
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">O</span>
                </div>
                <span className="font-bold text-lg text-foreground whitespace-nowrap">
                  Orion Path
                </span>
              </Link>
            )}

            {isCollapsed && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link 
                      to="/" 
                      className="flex items-center justify-center"
                      onClick={() => handleNavigation('/')}
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">O</span>
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Orion Path</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* Close button for mobile overlay */}
            {isOverlay && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarState('hidden')}
                className="h-8 w-8 p-0"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Expand/Collapse button for tablet */}
            {window.innerWidth >= 768 && window.innerWidth < 1024 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTabletSidebar}
                className={cn(
                  'h-8 w-8 p-0 transition-all duration-300',
                  isCollapsed && 'absolute -right-3 top-1/2 -translate-y-1/2 bg-card border border-border rounded-full shadow-md'
                )}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronRight className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  isExpanded && 'rotate-180'
                )} />
              </Button>
            )}
          </div>

          {/* Auth Status */}
          {isExpanded && (
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

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <div className={cn(
              'space-y-1',
              isCollapsed ? 'p-2' : 'p-4'
            )}>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                
                const buttonContent = (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      'transition-all duration-200',
                      isCollapsed 
                        ? 'w-12 h-12 p-0 justify-center' 
                        : 'w-full justify-start space-x-3 h-12',
                      item.requiresAuth && !isLoggedIn && 'opacity-50'
                    )}
                    onClick={() => handleNavigation(item.href, item.requiresAuth)}
                    aria-label={isCollapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {isExpanded && <span className="whitespace-nowrap">{item.title}</span>}
                  </Button>
                )

                if (isCollapsed) {
                  return (
                    <TooltipProvider key={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {buttonContent}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                }

                return (
                  <div key={item.href}>
                    {buttonContent}
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Bottom controls */}
          <div className={cn(
            'border-t border-border',
            isCollapsed ? 'p-2 space-y-1' : 'p-4 space-y-2'
          )}>
            {/* Theme Toggle */}
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-12 h-12 p-0 justify-center"
                      onClick={toggleTheme}
                      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                      {theme === 'light' ? (
                        <Moon className="h-5 w-5" />
                      ) : (
                        <Sun className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
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
            )}

            {/* Auth Action */}
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-12 h-12 p-0 justify-center"
                      onClick={handleAuthAction}
                      disabled={loading || isAuthLoading}
                      aria-label={isLoggedIn ? 'Sign out' : 'Sign in'}
                    >
                      {loading || isAuthLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isLoggedIn ? (
                        <LogOut className="h-5 w-5" />
                      ) : (
                        <LogIn className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{isLoggedIn ? 'Sign Out' : 'Sign In'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
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
            )}
          </div>
        </div>
      </aside>
    </>
  )
}