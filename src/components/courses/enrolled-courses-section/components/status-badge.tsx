import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatusBadgeProps {
  icon?: LucideIcon
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline'
  className?: string
}

export function StatusBadge({ 
  icon: Icon, 
  children, 
  variant = 'outline',
  className 
}: StatusBadgeProps) {
  return (
    <Badge variant={variant} className={cn("text-xs", className)}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </Badge>
  )
} 