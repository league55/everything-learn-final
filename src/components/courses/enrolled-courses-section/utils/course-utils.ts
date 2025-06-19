import type { CourseWithDetails } from '@/lib/supabase/types'

export const getDepthLabel = (depth: number) => {
  const labels = {
    1: 'Beginner',
    2: 'Casual',
    3: 'Hobby',
    4: 'Academic',
    5: 'Professional'
  }
  return labels[depth as keyof typeof labels] || 'Unknown'
}

export const getDepthColor = (depth: number) => {
  const colors = {
    1: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    4: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }
  return colors[depth as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const calculateProgress = (enrollment: any, syllabus: any) => {
  if (!syllabus?.modules || syllabus.modules.length === 0) return 0
  return Math.round((enrollment.current_module_index / syllabus.modules.length) * 100)
}

export const filterCoursesByStatus = (courses: CourseWithDetails[]) => {
  const activeCourses = courses.filter(course => 
    course.user_enrollment?.status === 'active'
  )
  
  const completedCourses = courses.filter(course => 
    course.user_enrollment?.status === 'completed'
  )

  const generatingCourses = activeCourses.filter(course => 
    course.generation_status === 'generating'
  )

  const readyCourses = activeCourses.filter(course => 
    course.generation_status === 'completed'
  )

  const failedCourses = activeCourses.filter(course => 
    course.generation_status === 'failed'
  )

  return {
    readyCourses,
    generatingCourses,
    failedCourses,
    completedCourses
  }
} 