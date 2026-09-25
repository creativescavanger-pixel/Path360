import { beginWithYourselfLesson } from './workshops/discover/lessons/beginWithYourself.lesson.js'

const lessons = [
  beginWithYourselfLesson,
]

const lessonsByKey = Object.fromEntries(
  lessons.map((lesson) => [lesson.key, lesson])
)

export function getLesson(lessonKey) {
  return lessonsByKey[lessonKey] ?? null
}

export function getLessonsForWorkshop(workshopKey) {
  return lessons.filter((lesson) => lesson.workshopKey === workshopKey)
}

export { lessons }