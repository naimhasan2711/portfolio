/**
 * Shapes of the portfolio content. You normally never need to edit this file —
 * edit the data files next to it (profile.ts, experience.ts, projects.ts, ...).
 */

export interface SocialLink {
  label: string
  href: string
  /** Icon key, see components/common/Icon.tsx */
  icon: 'linkedin' | 'mail' | 'github' | 'phone' | 'link'
}

export interface Stat {
  value: string
  label: string
}

export interface Experience {
  id: string
  company: string
  role: string
  location: string
  start: string
  end: string
  summary: string
  /** Short, scannable wins shown when the entry is collapsed. */
  highlights: Stat[]
  responsibilities: string[]
  technologies: string[]
  /** ids from projects.ts that belong to this role */
  projectIds: string[]
}

/** Abstract visual drawn for a project (there are no real screenshots). */
export type ProjectMotif = 'commerce' | 'meter' | 'business' | 'map' | 'health' | 'voucher'

export interface Project {
  id: string
  name: string
  company: string
  start: string
  end: string
  tagline: string
  motif: ProjectMotif
  featured: boolean
  technologies: string[]
  points: string[]
  highlight?: Stat
  link?: string
}

export interface SkillGroup {
  id: string
  title: string
  description: string
  skills: string[]
}

export interface Education {
  institution: string
  degree: string
  /** e.g. "Science group" */
  field?: string
  grade?: string
  start: string
  end: string
  location?: string
  /** Optional institution logo inside /public (transparent background works best). */
  logo?: string
}

export interface Certification {
  name: string
  issuer: string
  /** Link to the certificate (from the CV). */
  href?: string
}

export interface Achievement {
  title: string
  context: string
  period?: string
  stat?: Stat
  points: string[]
}
