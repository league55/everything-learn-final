import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  title: string
  description: string
  message?: string
}

export function LoadingState({ title, description, message = "Loading..." }: LoadingStateProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </section>
  )
} 