export function LearningPathHeader({ lesson }) {
  return (
    <header className="academy-learning-path__header">
      <p className="academy-learning-path__eyebrow">{lesson.eyebrow}</p>
      <div className="academy-learning-path__title-row">
        <div>
          <h1>{lesson.title}</h1>
          <p className="academy-learning-path__duration">{lesson.duration}</p>
        </div>
      </div>
      <ol className="academy-learning-path__steps" aria-label="Learning journey">
        {lesson.journey.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            {step}
          </li>
        ))}
      </ol>
    </header>
  );
}
