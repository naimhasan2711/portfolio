import type { Experience } from './types'

/**
 * ─────────────────────────────────────────────────────────────
 *  WORK EXPERIENCE — newest first.
 *  `projectIds` link to entries in projects.ts.
 * ─────────────────────────────────────────────────────────────
 */
export const experiences: Experience[] = [
  {
    id: 'bjit',
    company: 'BJIT Limited',
    role: 'Senior Software Engineer',
    location: 'Dhaka',
    start: 'November 2021',
    end: 'Present',
    summary:
      'Leading native Android development with Kotlin and Jetpack Compose, setting architecture standards and mentoring developers across cross-functional teams in Bangladesh and Japan.',
    highlights: [
      { value: '5+', label: 'Native apps led' },
      { value: '40%', label: 'Faster startup & UI' },
      { value: '25%', label: 'Fewer bug reports' },
      { value: '10+', label: 'Juniors mentored' },
    ],
    responsibilities: [
      'Spearheaded development of 5+ native Android apps using Kotlin and Jetpack Compose, increasing delivery speed by 30% through efficient architecture and tooling.',
      'Improved UI responsiveness and app startup time by 40% by optimizing Compose layouts and leveraging performance profiling tools.',
      'Designed and enforced MVVM and Clean Architecture across all projects, boosting maintainability and reducing bug reports by 25%.',
      'Integrated key services such as Firebase, Retrofit, Room and Google Maps, enabling seamless real-time features and location-based functionality.',
      'Mentored and onboarded 10+ junior developers, accelerating their project-readiness by 50% through structured guidance and code reviews.',
      'Collaborated with cross-functional teams in Bangladesh and Japan, contributing to the successful launch of 4 commercial-grade applications within tight Agile sprints.',
      'Drove technical decisions during sprint planning and code reviews, ensuring consistency in code quality and project scalability.',
      'Played a pivotal role in client satisfaction and retention by delivering robust, user-friendly solutions ahead of deadlines.',
    ],
    technologies: ['Kotlin', 'Jetpack Compose', 'MVVM', 'Clean Architecture', 'Firebase', 'Retrofit', 'Room', 'Google Maps'],
    projectIds: ['ecommerce', 'utility', 'business', 'entertainment'],
  },
  {
    id: 'nelsite',
    company: 'Nelsite Inc Ltd',
    role: 'Specialist Engineer',
    location: 'Fukuoka',
    start: 'December 2019',
    end: 'May 2020',
    summary:
      'Built the health monitoring module for "Wellsys", a smart health device, connecting IoT sensor data to an e-commerce platform.',
    highlights: [
      { value: '20%', label: 'More personalized sales' },
      { value: 'IoT', label: 'Real-time sensor data' },
    ],
    responsibilities: [
      'Engineered a health monitoring module for "Wellsys", a smart health device, enabling real-time data collection from IoT sensors.',
      'Integrated user health data into an e-commerce platform, driving a 20% increase in personalized supplement sales through AI-based recommendations.',
      'Conducted data flow and API analysis to ensure high reliability and low latency in mobile-to-server communication.',
    ],
    technologies: ['IoT sensors', 'Health data', 'API analysis', 'Mobile-to-server communication'],
    projectIds: ['healthcare-iot'],
  },
  {
    id: 'bdvoucher',
    company: 'BDVoucher.com',
    role: 'Junior Android Developer',
    location: 'Dhaka',
    start: 'January 2017',
    end: 'January 2018',
    summary:
      'Modernized a consumer voucher app — a refreshed Material Design UI, new features, and RESTful API integration.',
    highlights: [
      { value: '10+', label: 'Features delivered' },
      { value: '25%', label: 'Active user growth' },
      { value: '20%', label: 'Lower crash rate' },
    ],
    responsibilities: [
      'Revamped the app UI using XML and Material Design standards, improving user engagement.',
      'Delivered 10+ new features aligned with business needs, directly contributing to a 25% increase in active user base.',
      'Integrated RESTful APIs to sync front-end features with backend services, reducing crash rates by 20%.',
      'Proactively self-learned Android best practices and consistently implemented them to modernize the legacy codebase.',
    ],
    technologies: ['Android', 'XML', 'Material Design', 'REST APIs'],
    projectIds: ['bdvoucher'],
  },
]
