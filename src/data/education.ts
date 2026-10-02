import type { Certification, Education } from './types'

/** EDUCATION & CERTIFICATIONS — newest first. University is from the CV; HSC added by you. */
export const education: Education[] = [
  {
    institution: 'Daffodil International University',
    degree: 'Bachelor of Science in Computer Science & Engineering',
    grade: 'CGPA 3.70 / 4.00',
    start: 'May 2013',
    end: 'June 2017',
    location: 'Dhaka, Bangladesh',
    logo: '/diu-logo.webp',
  },
  {
    institution: 'Savar Cantonment Public School & College',
    degree: 'Higher Secondary Certificate (HSC)',
    field: 'Science group',
    grade: 'GPA 5.00 / 5.00',
    start: '2009',
    end: '2011',
    logo: '/scpsc-logo.webp',
  },
]

export const certifications: Certification[] = [
  {
    name: 'B-JET — Bangladesh-Japan ICT Engineer’s Training Program',
    issuer: 'B-JET',
    href: 'https://drive.google.com/file/d/1KjS1OEtS1nA3FJwBa5nnZMYea7rkvnT_/view',
  },
  {
    name: 'Scrum Team Member Accredited Certification',
    issuer: 'Scrum Institute',
    href: 'https://drive.google.com/file/d/1YB9NX397zoABwxM7f1TVV8cgoyOv7O4C/view',
  },
]
