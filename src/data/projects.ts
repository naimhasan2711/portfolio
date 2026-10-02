import type { Project } from './types'

/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS — newest first.
 *  `featured: true` shows the project as a large card.
 *  `motif` picks the abstract artwork (there are no screenshots):
 *    'commerce' | 'meter' | 'business' | 'map' | 'health' | 'voucher'
 *  Add `link: 'https://...'` to show an external link button.
 * ─────────────────────────────────────────────────────────────
 */
export const projects: Project[] = [
  {
    id: 'ecommerce',
    name: 'E-commerce App',
    company: 'BJIT Limited',
    start: 'April 2025',
    end: 'Present',
    tagline: 'A modular commerce app built on MVVM and Clean Architecture with a responsive XML UI.',
    motif: 'commerce',
    featured: true,
    technologies: ['Clean Architecture', 'MVVM', 'XML', 'Koin', 'Firebase', 'Retrofit', 'Room', 'Navigation Component', 'Google Maps'],
    points: [
      'Designed and implemented the app using MVVM with Clean Architecture, improving code maintainability and separation of concerns across modules.',
      'Built a responsive, high-performance UI using XML, enhancing usability across a range of Android devices.',
      'Led regular sync-ups with cross-functional teams including QA, UI/UX and backend, ensuring seamless collaboration and consistent feature delivery.',
      'Integrated Koin for dependency injection, along with Google Maps, Firebase, Retrofit, Room and the Navigation Component.',
    ],
  },
  {
    id: 'utility',
    name: 'Utility Management App',
    company: 'BJIT Limited',
    start: 'May 2024',
    end: 'February 2025',
    tagline: 'A GPS-enabled field app that digitizes utility meter readings — and keeps working offline.',
    motif: 'meter',
    featured: true,
    technologies: ['Jetpack Compose', 'MVVM', 'Firebase', 'Google Maps', 'Hilt', 'Room', 'Retrofit'],
    highlight: { value: '60%', label: 'Fewer reporting errors' },
    points: [
      'Architected and developed a GPS-enabled mobile app to digitize utility meter readings for field agents, replacing manual processes.',
      'Analyzed business and technical requirements to break down work items and define clear development milestones.',
      'Reduced reporting errors by 60% and improved operational efficiency across multiple departments through automated data capture and syncing.',
      'Integrated real-time location tracking and offline data caching to ensure uninterrupted usage in low-connectivity zones.',
      'Streamlined the UI using Jetpack Compose, enabling faster form input and enhanced usability for non-technical users.',
    ],
  },
  {
    id: 'business',
    name: 'Business Management App',
    company: 'BJIT Limited',
    start: 'March 2023',
    end: 'May 2024',
    tagline: 'A full-featured tool for team collaboration, task tracking and reporting — architected from scratch.',
    motif: 'business',
    featured: true,
    technologies: ['Kotlin', 'Jetpack Compose', 'Clean Architecture', 'Hilt', 'Firebase', 'Navigation Component'],
    highlight: { value: '35%', label: 'Higher user productivity' },
    points: [
      'Led the development of a full-featured business management tool supporting team collaboration, task tracking and reporting.',
      'Designed a scalable architecture from scratch, enabling a seamless rollout of 10+ major features over 4 releases.',
      'Coordinated across QA, design and backend teams to ensure on-time delivery with 98% test coverage.',
      'Increased internal user productivity by 35% through intuitive workflows and smart notifications.',
    ],
  },
  {
    id: 'entertainment',
    name: 'Entertainment App',
    company: 'BJIT Limited',
    start: 'May 2022',
    end: 'September 2022',
    tagline: 'Location-based entertainment with Zenrin Maps and personalized push content.',
    motif: 'map',
    featured: false,
    technologies: ['Kotlin', 'Firebase', 'Retrofit', 'Zenrin Map SDK', 'FCM', 'Coroutines'],
    highlight: { value: '40%', label: 'More daily engagement' },
    points: [
      'Built core functionality for a location-based entertainment app, integrating Zenrin Maps for advanced geolocation features.',
      'Enabled personalized content delivery using Firebase and push notifications, increasing daily user engagement by 40%.',
      'Improved data-fetching speed by 30% through optimized Retrofit calls and coroutine management.',
      'Delivered a smooth navigation experience across app sections using the Navigation Component and modern UI practices.',
    ],
  },
  {
    id: 'healthcare-iot',
    name: 'Healthcare IoT Integration',
    company: 'Nelsite Inc Ltd',
    start: 'January 2020',
    end: 'May 2020',
    tagline: 'Connecting an IoT health device to e-commerce for personalized wellness recommendations.',
    motif: 'health',
    featured: false,
    technologies: ['IoT sensors', 'Health data', 'E-commerce integration'],
    points: [
      'Engineered the integration between an IoT-based health device and an e-commerce platform to deliver personalized wellness recommendations.',
      'Enabled seamless health data acquisition through sensor input, resulting in richer user insights and behavior tracking.',
      'Collaborated with Japanese stakeholders to localize the product and align development with health data compliance standards.',
    ],
  },
  {
    id: 'bdvoucher',
    name: 'BDVoucher.com',
    company: 'BDVoucher',
    start: 'January 2017',
    end: 'January 2018',
    tagline: 'A redesigned voucher marketplace app with new filtering and sorting.',
    motif: 'voucher',
    featured: false,
    technologies: ['Android', 'XML', 'Material Design', 'REST APIs'],
    highlight: { value: '20%', label: 'More app downloads' },
    points: [
      'Redesigned an outdated UI with modern Android layouts, boosting app downloads by 20%.',
      'Developed new voucher filtering and sorting features, improving customer purchase efficiency.',
      'Coordinated with backend developers to ensure robust API integration and real-time data sync.',
    ],
  },
]
