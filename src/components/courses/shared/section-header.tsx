import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface SectionHeaderProps {
  title: string
  description: string
  showRefreshButton?: boolean
  onRefresh?: () => void
  refreshing?: boolean
}

export function SectionHeader({ 
  title, 
  description, 
  showRefreshButton = false,
  onRefresh,
  refreshing = false
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {showRefreshButton && onRefresh && (
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
    </div>
  )
} 