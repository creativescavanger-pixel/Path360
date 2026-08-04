// src/lib/academyClient.js
import { supabase } from '../lib/supabaseClient.js'

export async function getAcademyCourses() {
  const { data, error } = await supabase
    .from('academy_courses')
    .select('id, slug, title, subtitle, level, est_minutes')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCourseWithLessons(courseIdOrSlug) {
  if (!courseIdOrSlug) return { course: null, lessons: [] }

  let courseQuery = supabase
    .from('academy_courses')
    .select('id, slug, title, subtitle, level, est_minutes')
    .limit(1)

  const isUuid = /^[0-9a-f-]{36}$/i.test(String(courseIdOrSlug))

  if (isUuid) {
    courseQuery = courseQuery.eq('id', courseIdOrSlug)
  } else {
    courseQuery = courseQuery.eq('slug', courseIdOrSlug)
  }

  const { data: courseRows, error: courseError } = await courseQuery
  if (courseError) throw courseError

  const course = courseRows?.[0] || null
  if (!course) return { course: null, lessons: [] }

  const { data: lessons, error: lessonsError } = await supabase
    .from('academy_lessons')
    .select('id, slug, title, order_index, kind, video_url, content_markdown, course_id')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  if (lessonsError) throw lessonsError

  return { course, lessons: lessons || [] }
}