import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Settings, Wallet, Save, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { dbOperations } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import algosdk from 'algosdk'

interface AccountSettingsProps {
  user: User
}

interface UserProfile {
  algorand_address?: string
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [algorandAddress, setAlgorandAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [addressError, setAddressError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true)
        const profile = await dbOperations.getUserProfile(user.id)
        setUserProfile(profile)
        if (profile?.algorand_address) {
          setAlgorandAddress(profile.algorand_address)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
        // Create profile if it doesn't exist
        try {
          await dbOperations.createUserProfile(user.id)
          setUserProfile({})
        } catch (createError) {
          console.error('Failed to create user profile:', createError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user.id])

  // Validate Algorand address format
  const validateAlgorandAddress = (address: string): boolean => {
    if (!address.trim()) {
      setAddressError(null)
      return true // Empty address is allowed
    }

    try {
      // Algorand addresses are 58 characters long and use base32 encoding
      if (address.length !== 58) {
        setAddressError('Algorand address must be exactly 58 characters long')
        return false
      }

      // Use algosdk to validate the address
      const isValid = algosdk.isValidAddress(address)
      if (!isValid) {
        setAddressError('Invalid Algorand address format')
        return false
      }

      setAddressError(null)
      return true
    } catch (error) {
      setAddressError('Invalid Algorand address format')
      return false
    }
  }

  // Handle address input change
  const handleAddressChange = (value: string) => {
    setAlgorandAddress(value)
    validateAlgorandAddress(value)
  }

  // Save Algorand address
  const handleSaveAddress = async () => {
    if (!validateAlgorandAddress(algorandAddress)) {
      return
    }

    setSaving(true)
    try {
      await dbOperations.updateUserAlgorandAddress(user.id, algorandAddress.trim())
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        algorand_address: algorandAddress.trim()
      }))

      toast({
        title: "Address Updated",
        description: algorandAddress.trim() 
          ? "Your Algorand address has been saved successfully." 
          : "Your Algorand address has been removed.",
        duration: 3000,
      })
    } catch (error) {
      console.error('Failed to update Algorand address:', error)
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update address. Please try again.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  // Check if address has changed
  const hasAddressChanged = algorandAddress.trim() !== (userProfile?.algorand_address || '')

  // Get address validation status
  const getAddressStatus = () => {
    if (!algorandAddress.trim()) return null
    
    if (addressError) {
      return { type: 'error', message: addressError }
    }
    
    if (algosdk.isValidAddress(algorandAddress)) {
      return { type: 'success', message: 'Valid Algorand address' }
    }
    
    return null
  }

  const addressStatus = getAddressStatus()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading account settings...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Account Information */}
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

        {/* Blockchain Integration Section */}
        <div className="pt-6 border-t">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Blockchain Integration</h3>
              <Badge variant="outline" className="text-xs">
                Optional
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="algorand-address" className="flex items-center gap-2">
                Algorand Wallet Address
                <Badge variant="secondary" className="text-xs">
                  Certificates
                </Badge>
              </Label>
              <div className="space-y-2">
                <Input
                  id="algorand-address"
                  placeholder="Enter your Algorand wallet address (58 characters)"
                  value={algorandAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  disabled={saving}
                  className={`font-mono text-sm ${
                    addressStatus?.type === 'error' ? 'border-red-500 focus:border-red-500' :
                    addressStatus?.type === 'success' ? 'border-green-500 focus:border-green-500' : ''
                  }`}
                />
                
                {/* Address Status Indicator */}
                {addressStatus && (
                  <div className={`flex items-center gap-2 text-sm ${
                    addressStatus.type === 'error' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {addressStatus.type === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {addressStatus.message}
                  </div>
                )}
                
                {/* Save Button */}
                {hasAddressChanged && (
                  <Button
                    onClick={handleSaveAddress}
                    disabled={saving || !!addressError}
                    className="w-full sm:w-auto"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Address
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  Connect your Algorand wallet to receive blockchain-verified certificates for completed courses.
                </p>
                <p>
                  Your certificates will be stored on the Algorand blockchain for permanent verification.
                </p>
                <div className="flex items-center gap-1">
                  <span>Need an Algorand wallet?</span>
                  <a 
                    href="https://perawallet.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get Pera Wallet
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Current Status */}
            {userProfile?.algorand_address && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Blockchain Wallet Connected</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Your certificates will be automatically issued to the blockchain upon course completion.
                </p>
                <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/40 rounded text-xs font-mono break-all text-green-800 dark:text-green-200">
                  {userProfile.algorand_address}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Danger Zone */}
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