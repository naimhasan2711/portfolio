/**
 * ─────────────────────────────────────────────────────────────
 *  SITE SETTINGS — navigation, section headings and SEO.
 *  The SEO tags themselves live in /index.html (search engines read
 *  them before JavaScript runs) — keep both in sync if you change them.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Live site URL — update here too if you add a custom domain
 * (also update index.html, public/robots.txt and public/sitemap.xml).
 */
export const siteUrl = 'https://portfolio-nakibul-dev.vercel.app'

/**
 * 3D object in the middle of the hero:
 *  'workstation' — a corner home office: shelves, whiteboard, 3 monitors, PC
 *  'workspace' — a developer typing at a desk with a monitor full of code
 *  'core'      — layered "architecture core" (concentric layers around a faceted core)
 *  'phone'     — the original floating smartphone
 */
export const heroCenterpiece: 'workstation' | 'workspace' | 'core' | 'phone' = 'workstation'

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'android', label: 'Mobile' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof navItems)[number]['id']

/** Eyebrow / title / intro for each section. */
export const sections = {
  about: {
    eyebrow: 'About',
    title: 'Who I am',
  },
  android: {
    eyebrow: 'Specialization',
    title: 'Mobile engineering, end to end.',
    intro:
      'My deepest specialty is native Android: from Compose UI down to the data layer, these are the parts of the stack I use to ship production apps. Select a layer to explore it.',
  },
  experience: {
    eyebrow: 'Experience',
    title: 'Where I’ve built',
    intro: 'Product teams in Dhaka and Fukuoka — from my first engineering role to leading the development of commercial apps.',
  },
  projects: {
    eyebrow: 'Selected work',
    title: 'Projects',
    intro: 'Products I’ve architected and delivered.',
  },
  skills: {
    eyebrow: 'Toolbox',
    title: 'Technical skills',
    intro: 'Pick any technology to see where I’ve used it.',
  },
  leadership: {
    eyebrow: 'Beyond code',
    title: 'Mentoring & leadership',
  },
  education: {
    eyebrow: 'Foundations',
    title: 'Education & certifications',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Let’s build something solid.',
    intro: 'Have a role, a product or an engineering question in mind? My inbox is open.',
  },
} as const
