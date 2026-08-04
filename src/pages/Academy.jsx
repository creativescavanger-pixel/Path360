// src/pages/Academy.jsx

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getAcademyCourses, getCourseWithLessons } from '../lib/academyClient.js'

function safeExcerpt(text, max = 180) {
  const value = String(text || '').trim()
  if (!value) return ''
  if (value.length <= max) return value
  return `${value.slice(0, max).trim()}…`
}

export default function Academy() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingCourseDetail, setLoadingCourseDetail] = useState(false)
  const [error, setError] = useState('')

  const courseIdParam = searchParams.get('course')
  const lessonIdParam = searchParams.get('lesson')

  // Load all courses
  useEffect(() => {
    let active = true
    async function run() {
      setLoadingCourses(true)
      setError('')
      try {
        const list = await getAcademyCourses()
        if (!active) return
        setCourses(list)

        // Auto-select first course if none selected
        if (!courseIdParam && list.length > 0) {
          const first = list[0]
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            next.set('course', first.slug || first.id)
            return next
          })
        }
      } catch (err) {
        console.error(err)
        if (active) setError('Could not load Academy courses.')
      } finally {
        if (active) setLoadingCourses(false)
      }
    }
    run()
    return () => {
      active = false
    }
  }, []) // run once

  // Load selected course + lessons
  useEffect(() => {
    if (!courseIdParam) return

    let active = true
    async function run() {
      setLoadingCourseDetail(true)
      setError('')
      try {
        const { course, lessons: lessonList } = await getCourseWithLessons(courseIdParam)
        if (!active) return

        setSelectedCourse(course)
        setLessons(lessonList)

        if (lessonList.length === 0) {
          setSelectedLesson(null)
          return
        }

        // If no lesson query param, or current one not in this course, pick first
        const found =
          lessonList.find((l) => l.id === lessonIdParam || l.slug === lessonIdParam) || lessonList[0]

        setSelectedLesson(found)

        if (!lessonIdParam || !(lessonIdParam === found.id || lessonIdParam === found.slug)) {
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev)
            next.set('lesson', found.slug || found.id)
            return next
          })
        }
      } catch (err) {
        console.error(err)
        if (active) setError('Could not load this course.')
      } finally {
        if (active) setLoadingCourseDetail(false)
      }
    }
    run()

    return () => {
      active = false
    }
  }, [courseIdParam])

  function handleSelectCourse(course) {
    setSelectedCourse(course)
    setLessons([])
    setSelectedLesson(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('course', course.slug || course.id)
      next.delete('lesson')
      return next
    })
  }

  function handleSelectLesson(lesson) {
    setSelectedLesson(lesson)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('lesson', lesson.slug || lesson.id)
      return next
    })
  }

  function handleBackToStudio() {
    navigate('/app/studio')
  }

  return (
    <div style={{ padding: 24, maxWidth: 1160, margin: '0 auto' }}>
      {/* Header */}
      <div
        className="p360-card"
        style={{
          padding: 18,
          marginBottom: 18,
          borderRadius: 18,
          background: '#F7F5EF',
          border: '1px solid #E7DFCF',
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7A6A2F',
            marginBottom: 8,
          }}
        >
          Path360 Academy
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1A', marginBottom: 6 }}>
          Learn how to use Path360 and sharpen your founder craft
        </div>

        <div style={{ fontSize: 13.5, color: '#6B6965', lineHeight: 1.7 }}>
          Courses and short lessons that connect your diagnostics, reports, and investor work into one learning
          journey.
        </div>
      </div>

      {/* Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px minmax(0, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left: courses + lessons list */}
        <aside className="p360-card" style={{ padding: 16, borderRadius: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#111111', marginBottom: 10 }}>
            Courses
          </div>

          {loadingCourses && (
            <div style={{ fontSize: 12.5, color: '#8B938B', marginBottom: 12 }}>Loading courses…</div>
          )}

          {!loadingCourses && courses.length === 0 && (
            <div style={{ fontSize: 12.5, color: '#8B938B', marginBottom: 12 }}>
              No Academy courses yet. Add rows to <code>academy_courses</code> and{' '}
              <code>academy_lessons</code> in Supabase.
            </div>
          )}

          <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
            {courses.map((course) => {
              const isActive = selectedCourse && selectedCourse.id === course.id
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleSelectCourse(course)}
                  style={{
                    textAlign: 'left',
                    borderRadius: 12,
                    border: isActive ? '1.5px solid #1D6B4F' : '1px solid #DDE3DA',
                    background: isActive ? '#EAF1EB' : '#FFFFFF',
                    padding: 10,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: isActive ? '#1D6B4F' : '#111111',
                      marginBottom: 2,
                    }}
                  >
                    {course.title}
                  </div>
                  {course.subtitle && (
                    <div style={{ fontSize: 11.5, color: '#6B6965', marginBottom: 4 }}>
                      {course.subtitle}
                    </div>
                  )}
                  <div style={{ fontSize: 10.5, color: '#8B938B' }}>
                    {course.level === 'core'
                      ? 'Core'
                      : course.level === 'advanced'
                        ? 'Advanced'
                        : 'Intro'}{' '}
                    · {course.est_minutes ? `${course.est_minutes} min` : 'Self-paced'}
                  </div>
                </button>
              )
            })}
          </div>

          {selectedCourse && (
            <>
              <div
                style={{
                  marginTop: 6,
                  paddingTop: 10,
                  borderTop: '1px solid #E5E8E1',
                  marginBottom: 8,
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#111111',
                }}
              >
                Lessons
              </div>

              {loadingCourseDetail && (
                <div style={{ fontSize: 12.5, color: '#8B938B' }}>Loading lessons…</div>
              )}

              {!loadingCourseDetail && lessons.length === 0 && (
                <div style={{ fontSize: 12.5, color: '#8B938B' }}>
                  This course has no lessons yet.
                </div>
              )}

              <div style={{ display: 'grid', gap: 6 }}>
                {lessons.map((lesson, index) => {
                  const isActive = selectedLesson && selectedLesson.id === lesson.id
                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => handleSelectLesson(lesson)}
                      style={{
                        textAlign: 'left',
                        borderRadius: 10,
                        border: isActive ? '1.5px solid #1A7A4A' : '1px solid #E1E7DE',
                        background: isActive ? '#F1F7F3' : '#FFFFFF',
                        padding: 8,
                        cursor: 'pointer',
                        fontSize: 12.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          background: isActive ? '#1A7A4A' : '#EEF1EC',
                          color: isActive ? '#FFFFFF' : '#607060',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: '#111111',
                            marginBottom: 1,
                          }}
                        >
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: 11, color: '#8B938B' }}>
                          {lesson.kind === 'exercise'
                            ? 'Exercise'
                            : lesson.kind === 'reference'
                              ? 'Reference'
                              : 'Lesson'}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </aside>

        {/* Right: lesson viewer */}
        <main className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: 10,
                borderRadius: 10,
                border: '1px solid #F0D5D5',
                background: '#FFF8F8',
                color: '#7D2C2C',
                fontSize: 12.5,
              }}
            >
              {error}
            </div>
          )}

          {!selectedCourse && !loadingCourses && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111111', marginBottom: 6 }}>
                No course selected
              </div>
              <div style={{ fontSize: 13, color: '#6B6965', marginBottom: 12 }}>
                Choose a course from the left to start learning. You can manage Academy content from
                Supabase tables <code>academy_courses</code> and <code>academy_lessons</code>.
              </div>
              <button
                type="button"
                onClick={handleBackToStudio}
                style={{
                  borderRadius: 10,
                  border: '1px solid #D9DFD7',
                  padding: '9px 14px',
                  background: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Creation Studio
              </button>
            </div>
          )}

          {selectedCourse && (
            <div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11.5, color: '#8B938B', marginBottom: 2 }}>Course</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111111' }}>
                  {selectedCourse.title}
                </div>
                {selectedCourse.subtitle && (
                  <div style={{ fontSize: 13, color: '#6B6965', marginTop: 4 }}>
                    {selectedCourse.subtitle}
                  </div>
                )}
              </div>

              <div
                style={{
                  marginBottom: 14,
                  padding: 10,
                  borderRadius: 12,
                  background: '#F7F8F6',
                  border: '1px solid #E1E7DE',
                  fontSize: 12,
                  color: '#728072',
                }}
              >
                Academy connects directly to your Path360 diagnostics and reports. Use these lessons
                to understand what each output means and how to use it with investors.
              </div>

              {selectedLesson ? (
                <article>
                  <div style={{ fontSize: 13, color: '#8B938B', marginBottom: 4 }}>
                    Lesson {lessons.findIndex((l) => l.id === selectedLesson.id) + 1} of{' '}
                    {lessons.length}
                  </div>
                  <h2
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: '#111111',
                      margin: '0 0 8px',
                    }}
                  >
                    {selectedLesson.title}
                  </h2>

                  {selectedLesson.video_url && (
                    <div style={{ margin: '10px 0 16px' }}>
                      <div style={{ fontSize: 12, color: '#6B6965', marginBottom: 6 }}>
                        Video walkthrough
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          paddingBottom: '56.25%',
                          height: 0,
                          borderRadius: 12,
                          overflow: 'hidden',
                          background: '#000',
                        }}
                      >
                        <iframe
                          src={selectedLesson.video_url}
                          title={selectedLesson.title}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 10,
                      padding: 14,
                      borderRadius: 12,
                      background: '#F7F5F0',
                      border: '1px solid #E2DED6',
                      maxHeight: 520,
                      overflowY: 'auto',
                    }}
                  >
                    <pre
                      style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        lineHeight: 1.7,
                        color: '#1C1C1A',
                      }}
                    >
                      {safeExcerpt(selectedLesson.content_markdown || 'No content yet for this lesson.', 10000)}
                    </pre>
                  </div>
                </article>
              ) : (
                <div style={{ fontSize: 13, color: '#6B6965' }}>
                  Select a lesson from the left to see its content.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}