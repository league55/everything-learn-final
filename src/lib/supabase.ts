// Get all public courses (for course discovery)
  async getAllCourses(limit = 50, offset = 0): Promise<CourseWithDetails[]> {
    const { data: courses, error: coursesError } = await supabase
      .from('course_configuration')
      .select(`
        *,
        syllabus!inner(*),
        syllabus_generation_jobs(*)
      `)
      .eq('syllabus.status', 'completed')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (coursesError) {
      throw new Error(`Failed to fetch courses: ${coursesError.message}`)
    }

    if (!courses) return []

    // Get enrollment counts for each course
    const courseIds = courses.map(course => course.id)
    const { data: enrollmentCounts, error: countError } = await supabase
      .from('user_enrollments')
      .select('course_configuration_id')
      .in('course_configuration_id', courseIds)
      .eq('status', 'active')

    if (countError) {
      console.warn('Failed to fetch enrollment counts:', countError)
    }

    // Get current user's enrollments for these courses
    const { data: userEnrollments, error: enrollmentError } = await supabase
      .from('user_enrollments')
      .select('*')
      .in('course_configuration_id', courseIds)
      .eq('status', 'active')
      .order('enrolled_at', { ascending: false })

    if (enrollmentError) {
      console.warn('Failed to fetch user enrollments:', enrollmentError)
    }

    // Combine data
    return courses.map(course => {
      const enrollmentCount = enrollmentCounts?.filter(
        ec => ec.course_configuration_id === course.id
      ).length || 0

      const userEnrollment = userEnrollments?.find(
        ue => ue.course_configuration_id === course.id
      )

      return {
        ...course,
        syllabus: course.syllabus?.[0],
        generation_job: course.syllabus_generation_jobs?.[0],
        enrollment_count: enrollmentCount,
        user_enrollment: userEnrollment
      }
    })
  },

  // Get user's created courses (including ones being generated)
  async getCourseConfigurations(): Promise<CourseConfiguration[]> {
    const { data, error } = await supabase
      .from('course_configuration')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch course configurations: ${error.message}`)
    }

    return data || []
  },

  // Get user's created courses with full details (including generation status)
  async getUserCreatedCoursesWithDetails(): Promise<CourseWithDetails[]> {
    const { data: courses, error: coursesError } = await supabase
      .from('course_configuration')
      .select(`
        *,
        syllabus(*),
        syllabus_generation_jobs(*)
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      throw new Error(`Failed to fetch user courses: ${coursesError.message}`)
    }

    if (!courses) return []

    // Get enrollment counts for each course
    const courseIds = courses.map(course => course.id)
    const { data: enrollmentCounts, error: countError } = await supabase
      .from('user_enrollments')
      .select('course_configuration_id')
      .in('course_configuration_id', courseIds)
      .eq('status', 'active')

    if (countError) {
      console.warn('Failed to fetch enrollment counts:', countError)
    }

    // Combine data
    return courses.map(course => {
      const enrollmentCount = enrollmentCounts?.filter(
        ec => ec.course_configuration_id === course.id
      ).length || 0

      return {
        ...course,
        syllabus: course.syllabus?.[0],
        generation_job: course.syllabus_generation_jobs?.[0],
        enrollment_count: enrollmentCount
      }
    })
  },