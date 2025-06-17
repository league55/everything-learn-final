interface PendingCourse {
  topic: string
  context: string
  depth: number
  timestamp: number
}

export class CourseStorage {
  private readonly STORAGE_KEY = 'orion_pending_course'
  private readonly MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

  storePendingCourse(course: { topic: string; context: string; depth: number }): void {
    const pendingCourse: PendingCourse = {
      ...course,
      timestamp: Date.now()
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pendingCourse))
  }

  getPendingCourse(): PendingCourse | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const pendingCourse: PendingCourse = JSON.parse(stored)
      
      // Check if expired
      if (Date.now() - pendingCourse.timestamp > this.MAX_AGE) {
        this.clearPendingCourse()
        return null
      }

      return pendingCourse
    } catch (error) {
      console.error('Failed to retrieve pending course:', error)
      this.clearPendingCourse()
      return null
    }
  }

  clearPendingCourse(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  hasPendingCourse(): boolean {
    return this.getPendingCourse() !== null
  }
}

export const courseStorage = new CourseStorage()