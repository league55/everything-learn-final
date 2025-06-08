import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings } from 'lucide-react'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="user-id">User ID</Label>
            <Input
              id="user-id"
              value={user?.id || ''}
              disabled
              className="bg-muted font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">
              Your unique user identifier.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Danger Zone</h3>
          <Alert>
            <AlertDescription>
              Account deletion is not currently available through the interface. 
              Contact support if you need to delete your account.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  )
}