import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'
import {
  Home,
  BookOpen,
  User,
  Moon,
  Sun,
  LogIn,
  LogOut,
  ChevronRight
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
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function Sidebar({ className }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, setTheme } = useTheme()
  const location = useLocation()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out',
        isExpanded ? 'w-64' : 'w-16',
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <span className="font-bold text-lg text-foreground whitespace-nowrap">
                Orion Path
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center rounded-lg text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group relative',
                  isExpanded ? 'space-x-3 px-3 py-2' : 'justify-center py-2 px-2',
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center flex-shrink-0',
                  !isExpanded && isActive && 'bg-primary/20 rounded-md',
                  !isExpanded ? 'h-8 w-8' : 'h-5 w-5'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                  )}
                >
                  <span className="whitespace-nowrap">{item.title}</span>
                </div>
                {isActive && isExpanded && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-border p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className={cn(
              'w-full transition-all',
              isExpanded ? 'justify-start space-x-3 px-3' : 'justify-center px-2'
            )}
          >
            <div className={cn(
              'flex items-center justify-center flex-shrink-0',
              !isExpanded ? 'h-8 w-8' : 'h-5 w-5'
            )}>
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </div>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <span className="whitespace-nowrap">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLogin}
            className={cn(
              'w-full transition-all',
              isExpanded ? 'justify-start space-x-3 px-3' : 'justify-center px-2'
            )}
          >
            <div className={cn(
              'flex items-center justify-center flex-shrink-0',
              !isExpanded ? 'h-8 w-8' : 'h-5 w-5'
            )}>
              {isLoggedIn ? (
                <LogOut className="h-5 w-5" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
            </div>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
              )}
            >
              <span className="whitespace-nowrap">
                {isLoggedIn ? 'Logout' : 'Login'}
              </span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}