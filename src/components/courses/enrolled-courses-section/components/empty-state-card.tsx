import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  description: string
  iconColor?: string
}

export function EmptyStateCard({ 
  icon: Icon, 
  title, 
  description, 
  iconColor = "text-muted-foreground" 
}: EmptyStateCardProps) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
      <CardHeader className="text-center py-8">
        <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CardTitle className="text-xl text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center pb-8">
        <p className="text-muted-foreground mb-4">
          {description}
        </p>
      </CardContent>
    </Card>
  )
} 