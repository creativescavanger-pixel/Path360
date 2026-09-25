export function getLessonById(lessons, lessonId) {
  return lessons.find((lesson) => lesson.id === lessonId) || null;
}

export function getLessonsByStage(lessons, stageKey) {
  return lessons
    .filter((lesson) => lesson.stageKey === stageKey)
    .sort((first, second) => first.order - second.order);
}

export function getLessonResourcesByType(lesson, type) {
  return lesson.resources.filter((resource) => resource.type === type);
}
