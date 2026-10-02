import { achievements } from '../data/achievements'
import { experiences } from '../data/experience'
import { projects } from '../data/projects'
import { skillAliases } from '../data/skills'

export interface SkillUsage {
  kind: 'project' | 'role' | 'training'
  name: string
  context: string
  href: string
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Finds every project, role and training entry that mentions a skill —
 * either in its technology list or in its description text.
 */
export function findSkillUsage(skill: string): SkillUsage[] {
  const terms = [skill, ...(skillAliases[skill] ?? [])]
  const pattern = new RegExp(`(^|[^\\w])(${terms.map(escape).join('|')})(?![\\w])`)
  const mentions = (tech: string[], texts: string[]) => tech.some((t) => terms.includes(t)) || texts.some((t) => pattern.test(t))

  const usage: SkillUsage[] = []
  for (const e of experiences) {
    if (mentions(e.technologies, [e.summary, ...e.responsibilities])) {
      usage.push({ kind: 'role', name: e.role, context: e.company, href: '#experience' })
    }
  }
  for (const p of projects) {
    if (mentions(p.technologies, p.points)) {
      usage.push({ kind: 'project', name: p.name, context: p.company, href: `#project-${p.id}` })
    }
  }
  for (const a of achievements) {
    if (mentions([], a.points)) {
      usage.push({ kind: 'training', name: a.title, context: a.context, href: '#leadership' })
    }
  }
  return usage
}
