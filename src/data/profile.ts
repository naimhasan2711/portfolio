import type { SocialLink, Stat } from './types'

/**
 * ─────────────────────────────────────────────────────────────
 *  PERSONAL INFORMATION — edit this file to update who you are.
 *  Every value below comes from the CV (md_nakibul_hassan_resume.pdf).
 * ─────────────────────────────────────────────────────────────
 */
export const profile = {
  name: 'MD Nakibul Hassan',
  /** Used in the navigation logo and favicon. */
  initials: 'NH',
  title: 'Senior Software Engineer',
  location: 'Dhaka, Bangladesh',
  email: 'nakibhasan2711@gmail.com',

  /** Shown under your name in the hero. */
  specialties: ['Software Engineering', 'Kotlin', 'Jetpack Compose', 'Clean Architecture'],

  /** One short paragraph for the hero. */
  intro:
    'I design and build scalable, high-performance software — from clean, maintainable architecture and API integrations to polished mobile products — working with cross-functional teams across Bangladesh and Japan.',

  /** Experience as written on the CV. */
  yearsOfExperience: '5+',

  /**
   * Portrait inside /public (background removed, transparent PNG/WebP works best).
   * Set to undefined to hide it.
   */
  photo: '/portrait.webp' as string | undefined,

  /** Small round photo used in the navigation bar. Set to undefined to show the initials instead. */
  avatar: '/avatar.webp' as string | undefined,
} as const

/** Social / contact links. Only add links that really exist. */
export const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nakibulhasan2711/', icon: 'linkedin' },
  { label: 'GitHub', href: 'https://github.com/naimhasan2711', icon: 'github' },
  { label: 'Email', href: `mailto:${profile.email}`, icon: 'mail' },
]

/** About section copy. */
export const about = {
  heading: 'Engineering software that stays fast, clean and maintainable.',
  /** Part of the heading shown in the elegant italic serif. Must appear in `heading`. */
  headingEmphasis: 'fast, clean',
  paragraphs: [
    'I am a Senior Software Engineer at BJIT Limited in Dhaka. Over 5+ years I have built production software end to end — most deeply on mobile, with native Android in Kotlin, Java and Jetpack Compose — alongside IoT device integration, API and data-flow analysis, and mentoring engineers.',
    'My work spans end-to-end feature development — from breaking down requirements and defining milestones, to designing the architecture, integrating services like Firebase, Retrofit, Room and Google Maps, and profiling performance before release.',
    'Alongside delivery, I mentor and onboard developers, drive technical decisions in sprint planning and code reviews, and collaborate with cross-functional teams in Bangladesh and Japan.',
  ],
  /** Short principles drawn from how the CV describes the work. */
  principles: [
    {
      title: 'Architecture first',
      body: 'MVVM and Clean Architecture enforced across projects for separation of concerns and long-term maintainability.',
    },
    {
      title: 'Performance is a feature',
      body: 'Compose layouts optimized with profiling tools — UI responsiveness and startup time improved by 40%.',
    },
    {
      title: 'User-centric delivery',
      body: 'Robust, user-friendly solutions delivered within tight Agile sprints, often ahead of deadlines.',
    },
    {
      title: 'Teams that grow',
      body: 'Structured guidance and code reviews that bring new developers to project-readiness faster.',
    },
  ],
}

/** Headline numbers — every one of these is stated in the CV. */
export const headlineStats: Stat[] = [
  { value: '5+', label: 'Years of software engineering' },
  { value: '8+', label: 'Native apps led at BJIT' },
  { value: '4', label: 'Commercial-grade app launches' },
  { value: '20+', label: 'Entry-level developers trained' },
]
