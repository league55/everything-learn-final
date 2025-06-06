import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { User, Mail, Calendar, Award, BookOpen, Target } from 'lucide-react'

export function ProfilePage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Profile</h1>
          <p className="text-xl text-muted-foreground">
            Manage your learning journey and track your progress.
          </p>
        </div>

        <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
          <CardHeader className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-muted rounded-lg flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl text-muted-foreground">
              Profile Dashboard Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-12">
            <p className="text-muted-foreground max-w-md mx-auto">
              Your personalized learning dashboard will be available soon. 
              Track progress, manage courses, and customize your learning experience.
            </p>
          </CardContent>
        </Card>

        {/* Placeholder profile sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 opacity-50">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john.doe@example.com</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>john.doe@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined January 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Courses Completed</span>
                  <span>3/5</span>
                </div>
                <Progress value={60} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Learning Streak</span>
                  <span>7 days</span>
                </div>
                <Progress value={70} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Hours</span>
                  <span>42h</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                First Course Completed
              </Badge>
              <Badge variant="secondary" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Learning Streak: 7 Days
              </Badge>
              <Badge variant="outline" className="w-full justify-start opacity-50">
                <Award className="h-4 w-4 mr-2" />
                Course Master (Locked)
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}