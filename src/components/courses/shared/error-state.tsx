import { Alert, AlertDescription } from '@/components/ui/alert'

interface ErrorStateProps {
  title: string
  description: string
  error: string
}

export function ErrorState({ title, description, error }: ErrorStateProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </section>
  )
} 