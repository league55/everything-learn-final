import { User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User as UserIcon, Mail, Calendar, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAccountAge = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years > 1 ? 's' : ''}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Personal Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
            <AvatarFallback className="text-lg">
              {user?.email ? getInitials(user.email) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-lg">
              {user?.user_metadata?.full_name || 
               user?.user_metadata?.name || 
               user?.email?.split('@')[0] || 
               'User'}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
              </Badge>
              {user?.created_at && (
                <Badge variant="secondary" className="text-xs">
                  {getAccountAge(user.created_at)} old
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {user?.created_at ? formatDate(user.created_at) : 'Recently'}</span>
          </div>
        </div>

        {/* Additional user metadata if available */}
        {user?.user_metadata && Object.keys(user.user_metadata).length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Account Details</p>
            <div className="space-y-1 text-xs">
              {user.user_metadata.provider && (
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <span className="capitalize">{user.user_metadata.provider}</span>
                </div>
              )}
              {user.last_sign_in_at && (
                <div className="flex justify-between">
                  <span>Last Sign In:</span>
                  <span>{formatDate(user.last_sign_in_at)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}