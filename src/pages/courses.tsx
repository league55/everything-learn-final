import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Users } from 'lucide-react'

export function CoursesPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Courses Library</h1>
          <p className="text-xl text-muted-foreground">
            Discover AI-powered courses tailored to your learning goals.
          </p>
        </div>

        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl text-muted-foreground">
              Courses Library Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12">
            <p className="text-muted-foreground max-w-md mx-auto">
              We're working on bringing you an amazing collection of AI-generated courses. 
              Check back soon for updates!
            </p>
          </CardContent>
        </Card>

        {/* Placeholder course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 opacity-50">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20" />
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Course Title {index + 1}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Course description will appear here when courses are available.
                </p>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>2-4 hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1.2k students</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}