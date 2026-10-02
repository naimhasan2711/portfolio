/**
 * ─────────────────────────────────────────────────────────────
 *  ANDROID SPECIALIZATION — the layers of the Android stack shown
 *  inside the phone in the "Android" section. All tools are from the CV.
 * ─────────────────────────────────────────────────────────────
 */
export interface AndroidLayer {
  id: string
  title: string
  caption: string
  tools: string[]
}

export const androidLayers: AndroidLayer[] = [
  {
    id: 'ui',
    title: 'UI',
    caption: 'Declarative Compose screens and responsive XML layouts.',
    tools: ['Jetpack Compose', 'XML', 'Material Design', 'Navigation Component'],
  },
  {
    id: 'state',
    title: 'State & Presentation',
    caption: 'Lifecycle-aware state that survives configuration changes.',
    tools: ['ViewModel', 'StateFlow', 'LiveData', 'MVVM'],
  },
  {
    id: 'architecture',
    title: 'Architecture & DI',
    caption: 'Clean Architecture boundaries wired with dependency injection.',
    tools: ['Clean Architecture', 'Hilt', 'Dagger2', 'Koin'],
  },
  {
    id: 'async',
    title: 'Concurrency & Background',
    caption: 'Structured concurrency, streams, paging and scheduled work.',
    tools: ['Coroutines', 'Flow', 'WorkManager', 'Paging 3'],
  },
  {
    id: 'data',
    title: 'Data & Networking',
    caption: 'Type-safe APIs, offline caching and local persistence.',
    tools: ['Retrofit', 'OkHttp', 'Moshi', 'Gson', 'Room', 'DataStore'],
  },
  {
    id: 'services',
    title: 'Platform Services',
    caption: 'Real-time features, push messaging and location.',
    tools: ['Firebase', 'FCM', 'Google Maps', 'Zenrin Map SDK'],
  },
  {
    id: 'quality',
    title: 'Quality',
    caption: 'Tests, profiling, leak detection and crash reporting.',
    tools: ['JUnit', 'Espresso', 'Mockito', 'LeakCanary', 'Profiler', 'Firebase Crashlytics'],
  },
]

/** Languages shown on the phone's status bar. */
export const androidLanguages = ['Kotlin', 'Java']
