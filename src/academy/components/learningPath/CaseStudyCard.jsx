export function CaseStudyCard({ caseStudy }) {
  return (
    <section className="academy-learning-path__section">
      <p className="academy-learning-path__section-label">03 · See a real case</p>
      <article className="academy-case-card">
        <p className="academy-case-card__company">{caseStudy.company}</p>
        <h2>{caseStudy.title}</h2>
        <p>{caseStudy.context}</p>
        <div className="academy-case-card__grid">
          <div>
            <h3>What they observed</h3>
            <p>{caseStudy.originalObservation}</p>
          </div>
          <div>
            <h3>Existing workarounds</h3>
            <ul>
              {caseStudy.existingWorkarounds.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="academy-case-card__moves">
          <h3>What the team did early</h3>
          <ul>
            {caseStudy.earlyMoves.map((move) => <li key={move}>{move}</li>)}
          </ul>
        </div>
        <div className="academy-case-card__lesson">
          <h3>What to learn</h3>
          <p>{caseStudy.transferableLesson}</p>
        </div>
        <div className="academy-case-card__caution">
          <h3>What not to copy</h3>
          <p>{caseStudy.contextSpecificNote}</p>
        </div>
      </article>
    </section>
  );
}
