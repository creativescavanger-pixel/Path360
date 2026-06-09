import { create } from 'zustand'

const usePath360Store = create((set) => ({
  founderProfile: {
    fullName: '',
    ventureName: '',
    industry: '',
    stage: '',
  },
  assessmentResults: null,
  setFounderProfile: (profile) => set({ founderProfile: profile }),
  setAssessmentResults: (results) => set({ assessmentResults: results }),
}))

export default usePath360Store