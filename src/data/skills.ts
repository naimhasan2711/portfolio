import type { SkillGroup } from './types'

/**
 * ─────────────────────────────────────────────────────────────
 *  TECHNICAL SKILLS — grouped exactly as in the CV.
 *  No proficiency percentages on purpose: the CV doesn't state any.
 * ─────────────────────────────────────────────────────────────
 */
export const skillGroups: SkillGroup[] = [
  {
    id: 'android',
    title: 'Android Development',
    description: 'UI, architecture, state and background work on modern Android.',
    skills: [
      'Jetpack Compose', 'XML', 'MVVM', 'Clean Architecture', 'Navigation Component', 'WorkManager',
      'Paging 3', 'DataStore', 'ViewModel', 'LiveData', 'StateFlow', 'Hilt', 'Dagger2', 'Koin', 'Coroutines', 'Flow',
    ],
  },
  {
    id: 'languages',
    title: 'Programming Languages',
    description: 'Kotlin first, with Java and a wider toolbox.',
    skills: ['Kotlin', 'Java', 'Dart', 'Python'],
  },
  {
    id: 'testing',
    title: 'Testing & Debugging',
    description: 'Verifying behaviour and hunting down leaks, crashes and slow frames.',
    skills: ['JUnit', 'Espresso', 'Mockito', 'Firebase Crashlytics', 'LeakCanary', 'Profiler', 'ADB'],
  },
  {
    id: 'networking',
    title: 'API & Networking',
    description: 'Type-safe HTTP clients and JSON serialization.',
    skills: ['Retrofit', 'OkHttp', 'Gson', 'Moshi'],
  },
  {
    id: 'database',
    title: 'Database Technologies',
    description: 'Local persistence and relational data.',
    skills: ['RoomDB', 'MySQL'],
  },
  {
    id: 'cicd',
    title: 'CI/CD & Tools',
    description: 'Version control and automated delivery.',
    skills: ['Git', 'GitHub Actions', 'Fastlane'],
  },
  {
    id: 'design',
    title: 'Design & API Tools',
    description: 'Working from designs and exercising APIs.',
    skills: ['Figma', 'Postman'],
  },
  {
    id: 'environments',
    title: 'Development Environments',
    description: 'Where the work happens.',
    skills: ['Android Studio', 'VS Code', 'Jupyter Notebook'],
  },
]

/**
 * A few skills are written differently in projects than in the skills list
 * (e.g. "RoomDB" vs "Room"). This maps them so the "Used in" panel can find
 * the related projects and roles.
 */
export const skillAliases: Record<string, string[]> = {
  RoomDB: ['Room'],
}
