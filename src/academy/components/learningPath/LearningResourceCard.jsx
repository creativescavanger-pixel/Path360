const typeLabel = {
  video: 'Watch',
  article: 'Read',
  framework: 'Use'
};

export function LearningResourceCard({ resource }) {
  const label = typeLabel[resource.type] || 'Explore';
  const content = (
    <>
      <div className="academy-resource-card__meta">
        <span>{label}</span>
        <span>{resource.duration}</span>
      </div>
      <h3>{resource.title}</h3>
      <p className="academy-resource-card__provider">{resource.provider}</p>
      <p>{resource.whyItMatters}</p>
      <div className="academy-resource-card__prompt">
        <strong>{label} for this:</strong>
        <p>{resource.learningPrompt}</p>
      </div>
    </>
  );

  if (!resource.url) {
    return <article className="academy-resource-card">{content}</article>;
  }

  return (
    <a className="academy-resource-card academy-resource-card--link" href={resource.url} target="_blank" rel="noreferrer">
      {content}
      <span className="academy-resource-card__link-label">Open resource ↗</span>
    </a>
  );
}
