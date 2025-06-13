import { supabase } from './supabase'
import type { User, Session } from '@supabase/supabase-js'

interface StoredAuthData {
  user: User
  session: Session
  timestamp: number
  expiresAt: number
}

export class AuthStorage {
  private readonly STORAGE_KEY = 'orion_auth_data'
  private readonly LIBRARY_STORAGE_KEY = 'orion_library_auth'
  private readonly MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  /**
   * Store authentication data for cross-domain library access
   */
  async storeAuthForLibrary(user: User): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('No active session found')
        return
      }

      const authData: StoredAuthData = {
        user,
        session,
        timestamp: Date.now(),
        expiresAt: new Date(session.expires_at || 0).getTime()
      }

      // Store in localStorage for cross-domain access
      localStorage.setItem(this.LIBRARY_STORAGE_KEY, JSON.stringify(authData))
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem(this.LIBRARY_STORAGE_KEY, JSON.stringify(authData))

      console.log('Auth data stored for library access')
    } catch (error) {
      console.error('Failed to store auth data for library:', error)
    }
  }

  /**
   * Retrieve stored authentication data
   */
  getStoredAuthData(): StoredAuthData | null {
    try {
      // Try localStorage first, then sessionStorage
      const stored = localStorage.getItem(this.LIBRARY_STORAGE_KEY) || 
                   sessionStorage.getItem(this.LIBRARY_STORAGE_KEY)
      
      if (!stored) return null

      const authData: StoredAuthData = JSON.parse(stored)
      
      // Check if data is expired
      if (Date.now() > authData.expiresAt) {
        this.clearStoredAuthData()
        return null
      }

      // Check if data is too old (beyond max age)
      if (Date.now() - authData.timestamp > this.MAX_AGE) {
        this.clearStoredAuthData()
        return null
      }

      return authData
    } catch (error) {
      console.error('Failed to retrieve stored auth data:', error)
      this.clearStoredAuthData()
      return null
    }
  }

  /**
   * Clear stored authentication data
   */
  clearStoredAuthData(): void {
    localStorage.removeItem(this.LIBRARY_STORAGE_KEY)
    sessionStorage.removeItem(this.LIBRARY_STORAGE_KEY)
    localStorage.removeItem(this.STORAGE_KEY)
    sessionStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Update stored auth data when session changes
   */
  async updateStoredAuthData(user: User | null, session: Session | null): Promise<void> {
    if (!user || !session) {
      this.clearStoredAuthData()
      return
    }

    await this.storeAuthForLibrary(user)
  }

  /**
   * Get auth data formatted for library consumption
   */
  getLibraryAuthData(): { accessToken: string; refreshToken: string; user: User } | null {
    const authData = this.getStoredAuthData()
    
    if (!authData) return null

    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: authData.user
    }
  }

  /**
   * Check if current auth is valid for library access
   */
  isAuthValidForLibrary(): boolean {
    const authData = this.getStoredAuthData()
    return authData !== null
  }

  /**
   * Generate library URL with auth parameters
   */
  generateLibraryUrl(basePath: string, courseId?: string): string {
    const baseUrl = 'https://www.library.everythinglearn.online'
    const authData = this.getLibraryAuthData()
    
    let url = `${baseUrl}${basePath}`
    if (courseId) {
      url = url.replace(':courseId', courseId)
    }

    // Add auth parameters if available
    if (authData) {
      const params = new URLSearchParams({
        access_token: authData.accessToken,
        refresh_token: authData.refreshToken,
        user_id: authData.user.id
      })
      url += `?${params.toString()}`
    }

    return url
  }
}

// Export singleton instance
export const authStorage = new AuthStorage()