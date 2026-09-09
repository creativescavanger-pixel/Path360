import MissionObservationWorkarounds from '../../MissionObservationWorkarounds.jsx'
import { AcademyLearningPath } from '../../../academy/components/learningPath'
import { observationAndWorkaroundsLesson } from '../../../academy/content/lessons'

export default function DiscoverObservationLearningModule(props) {
  return (
    <AcademyLearningPath
      lesson={observationAndWorkaroundsLesson}
      applySection={<MissionObservationWorkarounds {...props} embedded />}
    />
  )
}
