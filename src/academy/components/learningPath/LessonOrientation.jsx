export function LessonOrientation({ orientation }) {
  return (
    <section className="academy-learning-path__section academy-learning-path__orientation">
      <p className="academy-learning-path__section-label">01 · Why this matters</p>
      <h2>{orientation.decision}</h2>
      <p>{orientation.whyItMatters}</p>
      <div className="academy-learning-path__outcome">
        <span>By the end</span>
        <p>{orientation.outcome}</p>
      </div>
    </section>
  );
}
