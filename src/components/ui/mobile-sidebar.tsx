import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { X, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileSidebarProps {
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  className?: string
  overlayClassName?: string
  sidebarClassName?: string
  closeButtonClassName?: string
  width?: string
  position?: 'left' | 'right'
}

export function MobileSidebar({
  children,
  isOpen,
  onToggle,
  onClose,
  className,
  overlayClassName,
  sidebarClassName,
  closeButtonClassName,
  width = '80%',
  position = 'left'
}: MobileSidebarProps) {
  const [mounted, setMounted] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle body scroll lock when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Touch gesture handlers
  const handleTouchStart = (e: TouchEvent) => {
    if (!isOpen) return
    
    startXRef.current = e.touches[0].clientX
    currentXRef.current = startXRef.current
    isDraggingRef.current = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current || !isOpen) return
    
    currentXRef.current = e.touches[0].clientX
    const deltaX = currentXRef.current - startXRef.current
    
    // Only allow closing gesture (swipe left for left sidebar, right for right sidebar)
    const shouldClose = position === 'left' ? deltaX < -50 : deltaX > 50
    
    if (shouldClose && sidebarRef.current) {
      const progress = Math.abs(deltaX) / 200 // Adjust sensitivity
      const opacity = Math.max(0, 1 - progress)
      const translateX = position === 'left' ? Math.min(0, deltaX) : Math.max(0, deltaX)
      
      sidebarRef.current.style.transform = `translateX(${translateX}px)`
      if (overlayRef.current) {
        overlayRef.current.style.opacity = opacity.toString()
      }
    }
  }

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || !isOpen) return
    
    const deltaX = currentXRef.current - startXRef.current
    const shouldClose = position === 'left' ? deltaX < -100 : deltaX > 100
    
    if (shouldClose) {
      onClose()
    } else if (sidebarRef.current) {
      // Reset position if not closing
      sidebarRef.current.style.transform = ''
      if (overlayRef.current) {
        overlayRef.current.style.opacity = ''
      }
    }
    
    isDraggingRef.current = false
  }

  // Add touch event listeners
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true })
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: true })
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart)
      sidebar.removeEventListener('touchmove', handleTouchMove)
      sidebar.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isOpen, position])

  if (!mounted) return null

  const sidebarContent = (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-all duration-300 ease-in-out',
        isOpen ? 'visible' : 'invisible',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className={cn(
          'absolute inset-0 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
          overlayClassName
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={cn(
          'absolute top-0 h-full bg-background border-r border-border shadow-xl transition-transform duration-300 ease-in-out overflow-y-auto',
          position === 'left' ? 'left-0' : 'right-0',
          isOpen 
            ? 'translate-x-0' 
            : position === 'left' 
              ? '-translate-x-full' 
              : 'translate-x-full',
          sidebarClassName
        )}
        style={{ width: width, maxWidth: '320px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={cn('h-8 w-8 p-0', closeButtonClassName)}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )

  return createPortal(sidebarContent, document.body)
}

// Hamburger menu button component
interface MobileSidebarTriggerProps {
  onClick: () => void
  className?: string
  'aria-label'?: string
}

export function MobileSidebarTrigger({ 
  onClick, 
  className,
  'aria-label': ariaLabel = 'Open navigation menu'
}: MobileSidebarTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn('h-8 w-8 p-0 md:hidden', className)}
      aria-label={ariaLabel}
    >
      <Menu className="h-4 w-4" />
    </Button>
  )
}