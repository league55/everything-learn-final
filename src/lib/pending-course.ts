interface PendingCourseConfig {
  topic: string
  context: string
  depth: number
  timestamp: number
}

const STORAGE_KEY = 'pendingCourseConfig'
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

export class PendingCourseManager {
  // Save course config to localStorage
  static savePendingConfig(config: Omit<PendingCourseConfig, 'timestamp'>): void {
    try {
      const pendingConfig: PendingCourseConfig = {
        ...config,
        timestamp: Date.now()
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingConfig))
      console.log('Saved pending course config:', pendingConfig)
    } catch (error) {
      console.error('Failed to save pending course config:', error)
    }
  }

  // Get pending config from localStorage
  static getPendingConfig(): PendingCourseConfig | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const config: PendingCourseConfig = JSON.parse(stored)
      
      // Check if config is too old
      if (Date.now() - config.timestamp > MAX_AGE) {
        this.clearPendingConfig()
        return null
      }

      return config
    } catch (error) {
      console.error('Failed to get pending course config:', error)
      this.clearPendingConfig()
      return null
    }
  }

  // Clear pending config from localStorage
  static clearPendingConfig(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('Cleared pending course config')
    } catch (error) {
      console.error('Failed to clear pending course config:', error)
    }
  }

  // Check if there's a valid pending config
  static hasPendingConfig(): boolean {
    return this.getPendingConfig() !== null
  }

  // Validate pending config before submission
  static validateConfig(config: PendingCourseConfig): boolean {
    return !!(
      config.topic?.trim() &&
      config.context?.trim() &&
      config.depth >= 1 &&
      config.depth <= 5
    )
  }
}