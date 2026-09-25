export function ReflectionDecision({ reflection }) {
  return (
    <section className="academy-learning-path__section academy-reflection">
      <p className="academy-learning-path__section-label">07 · Reflect and decide</p>
      <h2>{reflection.title}</h2>
      <ol>
        {reflection.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
      </ol>
      <div className="academy-reflection__decision">
        <h3>Your next decision</h3>
        <p>{reflection.decisionPrompt}</p>
      </div>
    </section>
  );
}
