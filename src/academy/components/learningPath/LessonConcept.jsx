export function LessonConcept({ concept }) {
  return (
    <section className="academy-learning-path__section">
      <p className="academy-learning-path__section-label">02 · Learn the distinction</p>
      <h2>{concept.title}</h2>
      <p>{concept.introduction}</p>
      <dl className="academy-learning-path__distinctions">
        {concept.distinctions.map(({ term, definition }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
      <div className="academy-learning-path__mistakes">
        <h3>Common mistakes to avoid</h3>
        <ul>
          {concept.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
        </ul>
      </div>
    </section>
  );
}
