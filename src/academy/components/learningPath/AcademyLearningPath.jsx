import './academyLearningPath.css';
import { LearningPathHeader } from './LearningPathHeader';
import { LessonOrientation } from './LessonOrientation';
import { LessonConcept } from './LessonConcept';
import { CaseStudyCard } from './CaseStudyCard';
import { LearningResourceCard } from './LearningResourceCard';
import { FieldworkMission } from './FieldworkMission';
import { ReflectionDecision } from './ReflectionDecision';

export function AcademyLearningPath({ lesson, applySection = null }) {
  return (
    <main className="academy-learning-path">
      <LearningPathHeader lesson={lesson} />
      <LessonOrientation orientation={lesson.orientation} />
      <LessonConcept concept={lesson.concept} />
      <CaseStudyCard caseStudy={lesson.caseStudy} />
      <section className="academy-learning-path__section">
        <p className="academy-learning-path__section-label">04 · Watch and read with intent</p>
        <h2>Go deeper before you apply</h2>
        <p>Use these resources to sharpen your observation. Do not consume them passively—carry the learning prompt into your own work.</p>
        <div className="academy-learning-path__resources">
          {lesson.resources.map((resource) => <LearningResourceCard key={resource.id} resource={resource} />)}
        </div>
      </section>
      <section className="academy-learning-path__section academy-framework">
        <p className="academy-learning-path__section-label">05 · Apply the framework</p>
        <h2>{lesson.framework.title}</h2>
        <p>{lesson.framework.purpose}</p>
        <ul className="academy-framework__fields">
          {lesson.framework.fields.map((field) => <li key={field}>{field}</li>)}
        </ul>
        <div className="academy-framework__example">
          <h3>{lesson.framework.workedExample.title}</h3>
          <p>{lesson.framework.workedExample.summary}</p>
          <p><strong>Evidence:</strong> {lesson.framework.workedExample.evidence}</p>
          <p><strong>Interpretation:</strong> {lesson.framework.workedExample.interpretation}</p>
          <p><strong>Next step:</strong> {lesson.framework.workedExample.nextStep}</p>
        </div>
        {applySection}
      </section>
      <FieldworkMission fieldwork={lesson.fieldwork} />
      <ReflectionDecision reflection={lesson.reflection} />
    </main>
  );
}
