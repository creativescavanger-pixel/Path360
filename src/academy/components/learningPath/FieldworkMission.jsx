export function FieldworkMission({ fieldwork }) {
  return (
    <section className="academy-learning-path__section academy-fieldwork">
      <p className="academy-learning-path__section-label">06 · Go into the field</p>
      <div className="academy-fieldwork__heading">
        <div>
          <h2>{fieldwork.title}</h2>
          <p>{fieldwork.instruction}</p>
        </div>
        <span className="academy-fieldwork__time">{fieldwork.timeBox}</span>
      </div>
      <h3>Capture this evidence</h3>
      <ul>
        {fieldwork.evidenceToCapture.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="academy-fieldwork__guardrail"><strong>Guardrail:</strong> {fieldwork.guardrail}</p>
    </section>
  );
}
