import { Button } from '@/components/ui/button'

interface CoursesHeaderProps {
  title: string
  description: string
  showCreateButton?: boolean
}

export function CoursesHeader({ 
  title, 
  description, 
  showCreateButton = false 
}: CoursesHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{title}</h1>
          <p className="text-xl text-muted-foreground">{description}</p>
        </div>
        {showCreateButton && (
          <Button asChild>
            <a href="/">Create New Course</a>
          </Button>
        )}
      </div>
    </div>
  )
}