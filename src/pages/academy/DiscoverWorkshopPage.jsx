import styles from './DiscoverWorkshopPage.module.css'

export default function DiscoverWorkshopPage({
  workshop,
  onBack,
  onStart,
  onOpenModule,
  onOpenResources,
  onBrowseCases,
  onBrowseFrameworks,
}) {
  const modules = workshop?.modules || []

  const moduleCount = modules.length

  const liveModuleCount = modules.filter(
    (module) =>
      module.availability === 'live' && Boolean(module.component),
  ).length

  const upcomingModuleCount = Math.max(0, moduleCount - liveModuleCount)

  return (
    <main className={styles.page}>
      <button type="button" className={styles.backLink} onClick={onBack}>
        <span aria-hidden="true">←</span>
        Back to Founder Workshop
      </button>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              Stage {workshop?.stageNumber || '00'} · Discover workshop
            </span>

            <h1>
              {workshop?.title || 'Discover Opportunities'}
              {workshop?.subtitle ? `: ${workshop.subtitle}` : ''}
            </h1>

            <p className={styles.heroDescription}>
              {workshop?.description ||
                'Use guided observations, frameworks, fieldwork, and evidence to discover opportunities worth investigating.'}
            </p>

            <div className={styles.question}>
              <span className={styles.questionLabel}>Founder question</span>

              <strong>
                {workshop?.founderQuestion || 'What opportunities could I responsibly investigate?'}
              </strong>
            </div>

            <div className={styles.heroActions}>
              <button type="button" className={styles.primaryButton} onClick={onStart}>
                Start this workshop
                <span aria-hidden="true">→</span>
              </button>

              <span className={styles.heroMeta}>
                Self-guided · Return whenever your evidence changes
              </span>
            </div>

            <div
              className={styles.resourceActions}
              aria-label="Discover workshop learning resources"
            >
              <button type="button" className={styles.secondaryButton} onClick={onOpenResources}>
                Discover resources
                <span aria-hidden="true">→</span>
              </button>

              <button type="button" className={styles.quietButton} onClick={onBrowseCases}>
                Founder cases
                <span aria-hidden="true">→</span>
              </button>

              <button type="button" className={styles.quietButton} onClick={onBrowseFrameworks}>
                Frameworks
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <aside className={styles.summary} aria-label="Discover workshop overview">
            <span className={styles.summaryLabel}>Your working path</span>

            <strong className={styles.summaryValue}>{moduleCount} modules</strong>

            <div className={styles.summaryStatus}>
              <span>{liveModuleCount} live workspaces</span>

              {upcomingModuleCount > 0 ? (
                <span>{upcomingModuleCount} coming next</span>
              ) : null}
            </div>

            <p>
              Observe real conditions, capture evidence, and decide what is
              worth investigating before committing to a solution.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.modulesSection}>
        <header className={styles.modulesHeader}>
          <div>
            <span className={styles.eyebrow}>Workshop modules</span>

            <h2>
              Work through the questions that matter before moving forward
            </h2>

            <p>
              This is a working programme—not a short course. Each module
              combines explanation, frameworks, fieldwork, evidence,
              reflection, and a founder-owned output.
            </p>
          </div>

          <span className={styles.moduleCount}>{moduleCount} modules</span>
        </header>

        <div className={styles.moduleCards}>
          {modules.map((module) => {
            const isLive =
              module.availability === 'live' && Boolean(module.component)

            return (
              <article
                key={module.key}
                className={`${styles.moduleCard} ${
                  !isLive ? styles.moduleCardUpcoming : ''
                }`}
              >
                <div
                  className={styles.moduleNumber}
                  aria-label={`Module ${module.number}`}
                >
                  {module.number}
                </div>

                <div className={styles.moduleCopy}>
                  <span className={styles.moduleLabel}>Module {module.number}</span>

                  <div className={styles.moduleTitleRow}>
                    <h3>{module.title}</h3>

                    {!isLive ? (
                      <span className={styles.comingSoon}>Coming next</span>
                    ) : null}
                  </div>

                  <p className={styles.moduleDetail}>
                    <span>Framework</span>
                    <span>{module.framework}</span>
                  </p>

                  <p className={styles.moduleOutput}>
                    <span>Create</span>
                    <strong>{module.output}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  className={`${styles.openButton} ${
                    !isLive ? styles.openButtonDisabled : ''
                  }`}
                  onClick={() => {
                    if (isLive) {
                      onOpenModule(module.key)
                    }
                  }}
                  disabled={!isLive}
                  aria-label={
                    isLive
                      ? `Open Module ${module.number}: ${module.title}`
                      : `Module ${module.number}: ${module.title} is coming next`
                  }
                >
                  {isLive ? 'Open' : 'Coming next'}
                  <span aria-hidden="true">{isLive ? '→' : '↗'}</span>
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section
        className={styles.learningSection}
        aria-labelledby="discover-learning-heading"
      >
        <div className={styles.learningIntro}>
          <span className={styles.eyebrow}>Learn alongside the work</span>

          <h2 id="discover-learning-heading">
            Use cases, frameworks, and sources when they help your next
            decision
          </h2>

          <p>
            The workshop gives you a path. The Resource Centre gives you
            deeper articles, founder cases, external tools, templates, and
            official sources connected to the work you are doing.
          </p>
        </div>

        <div className={styles.learningCards}>
          <button type="button" className={styles.learningCard} onClick={onBrowseCases}>
            <span className={styles.learningCardKicker}>Founder cases</span>

            <strong>
              Learn how founders moved from observation to an opportunity
            </strong>

            <span>
              Study early signals, customer problems, workarounds, tests, and
              first decisions.
            </span>

            <b>
              Explore cases <i aria-hidden="true">→</i>
            </b>
          </button>

          <button type="button" className={styles.learningCard} onClick={onBrowseFrameworks}>
            <span className={styles.learningCardKicker}>Framework library</span>

            <strong>
              Go deeper when you need another way to examine a question
            </strong>

            <span>
              Use structured tools for environment mapping, customer
              observation, problem definition, and opportunity comparison.
            </span>

            <b>
              Browse frameworks <i aria-hidden="true">→</i>
            </b>
          </button>

          <button type="button" className={styles.learningCard} onClick={onOpenResources}>
            <span className={styles.learningCardKicker}>Curated resources</span>

            <strong>
              Find articles, guides, videos, templates, and official sources
            </strong>

            <span>
              Use practical material connected to Discover rather than
              searching for generic startup advice.
            </span>

            <b>
              View resources <i aria-hidden="true">→</i>
            </b>
          </button>
        </div>
      </section>
    </main>
  )
}
