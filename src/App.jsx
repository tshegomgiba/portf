import { lazy, Suspense } from 'react'
import './App.css'
import Navbar from './Components/Navbar'
import ScrollProgress from './Components/ScrollProgress'
import About from './Components/About'
import Experience from './Components/Experience'
import ContactUs from './Components/Contact'
import Hero from './Components/Hero'
import Projects from './Components/Projects'
import Sphere from './Components/sphereText/Sphere'
import SnowEffect from './animation/SnowEffect'
import CustomCursor from './animation/CustomCursor'
import Preloader from './animation/Preloader'
import MiniCompanion from './animation/MiniCompanion'
import StackSection from './Components/StackSection'
import DesktopHint from './Components/DesktopHint'

const Companion = lazy(() => import('./animation/Companion'))

// The order these are stacked in. Each one covers the one before it as you
// scroll, so this list is also the painting order.
const PANELS = [Hero, About, Experience, Sphere, Projects, ContactUs]

function App() {
  return (
    <div className="relative bg-[#dfe8f1]">
      <Preloader />
      <SnowEffect />
      <CustomCursor />
      <Suspense fallback={null}>
        <Companion />
      </Suspense>
      <MiniCompanion />
      <ScrollProgress />
      <Navbar />
      <DesktopHint />
      <div className="stack-track">
        {PANELS.map((Panel, i) => (
          <StackSection key={i} index={i} last={i === PANELS.length - 1}>
            <Panel />
          </StackSection>
        ))}
      </div>
    </div>
  )
}

export default App;
