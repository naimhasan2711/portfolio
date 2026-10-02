import type { Achievement } from './types'

/** MENTORING & LEADERSHIP — from the CV. */
export const achievements: Achievement[] = [
  {
    title: 'Youth Skill Development Program',
    context: 'BJIT Limited',
    period: 'October 2022 – February 2023',
    stat: { value: '20+', label: 'Entry-level Android developers trained' },
    points: [
      'Trained and mentored 20+ entry-level Android developers, significantly improving their deployment readiness.',
      'Designed a structured curriculum focused on real-world development with Jetpack Compose, XML, MVVM and Retrofit.',
      'Conducted hands-on coding sessions, mock assessments and 1:1 mentoring to ensure learning retention.',
      'Evaluated and guided the development of individual capstone projects aligned with business needs.',
    ],
  },
  {
    title: 'Mentoring & Onboarding',
    context: 'BJIT Limited',
    stat: { value: '50%', label: 'Faster project-readiness for juniors' },
    points: [
      'Mentored and onboarded 10+ junior developers through structured guidance and code reviews.',
      'Drove technical decisions during sprint planning and code reviews to keep code quality consistent.',
    ],
  },
  {
    title: 'Cross-border Collaboration',
    context: 'Bangladesh & Japan',
    stat: { value: '4', label: 'Commercial-grade launches' },
    points: [
      'Collaborated with cross-functional teams in Bangladesh and Japan on commercial-grade applications within tight Agile sprints.',
      'Worked with Japanese stakeholders to localize a healthcare IoT product and align it with health data compliance standards.',
    ],
  },
]
