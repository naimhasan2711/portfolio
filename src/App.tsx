import { MotionConfig } from 'motion/react'
import { About } from './components/about/About'
import { Leadership } from './components/achievements/Leadership'
import { AndroidSection } from './components/android/AndroidSection'
import { CursorGlow, ScrollProgress } from './components/common/Ambient'
import { Footer } from './components/common/Footer'
import { Contact } from './components/contact/Contact'
import { Education } from './components/education/Education'
import { Experience } from './components/experience/Experience'
import { Hero } from './components/hero/Hero'
import { Navbar } from './components/navigation/Navbar'
import { Projects } from './components/projects/Projects'
import { Skills } from './components/skills/Skills'

/**
 * Page layout. Sections appear in this order — reorder or remove lines here.
 * Content lives in src/data/*, not in the components.
 */
export default function App() {
  return (
    // reducedMotion="user": Motion animations respect the OS "reduce motion" setting.
    <MotionConfig reducedMotion="user">
      <ScrollProgress />
      <CursorGlow />
      <Navbar />
      <main id="main" className="relative">
        <Hero />
        <About />
        <AndroidSection />
        <Experience />
        <Projects />
        <Skills />
        <Leadership />
        <Education />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  )
}
