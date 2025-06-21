import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, BookOpen, Target, Zap } from 'lucide-react'

export function EmptyCertificatesState() {
  const steps = [
    {
      icon: BookOpen,
      title: "Enroll in Courses",
      description: "Browse our course library and enroll in subjects that interest you.",
      action: "Browse Courses",
      link: "/courses"
    },
    {
      icon: Target,
      title: "Complete Learning",
      description: "Work through course modules, engage with content, and demonstrate your understanding.",
      action: null,
      link: null
    },
    {
      icon: Award,
      title: "Earn Certificates",
      description: "Pass final assessments to receive blockchain-verified certificates.",
      action: null,
      link: null
    },
    {
      icon: Zap,
      title: "Showcase Achievements",
      description: "Share your verifiable credentials with employers and on professional networks.",
      action: null,
      link: null
    }
  ]

  return (
    <div className="space-y-8">
      <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
        <CardHeader className="text-center py-12">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-6">
            <Award className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-muted-foreground mb-4">
            No Certificates Yet
          </CardTitle>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start your learning journey to earn blockchain-verified certificates that showcase your skills and knowledge.
          </p>
        </CardHeader>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-6 text-center">How to Earn Your First Certificate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative h-full">
              {/* Step number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                {index + 1}
              </div>
              
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full">
                <p className="text-muted-foreground flex-1 mb-4">{step.description}</p>
                
                {step.action && step.link && (
                  <Button asChild className="w-full mt-auto">
                    <a href={step.link}>{step.action}</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}