import { lazy, Suspense, useEffect, useState } from 'react'
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
import DesktopHint from './Components/DesktopHint'
import AtmosphereToggle from './animation/AtmosphereToggle'
import ReadAlong from './animation/ReadAlong'
import { getSession, watchSession, mountTalk } from './animation/experience'

const Companion = lazy(() => import('./animation/Companion'))

function App() {
  const [session, setSession] = useState(getSession);

  useEffect(() => watchSession(setSession), []);
  useEffect(() => {
    mountTalk();
  }, [session]);

  return (
    <div className="relative bg-[#dfe8f1]">
      <Preloader />
      <SnowEffect />
      <CustomCursor />
      <Suspense fallback={null}>
        <Companion key={`companion-${session}`} />
      </Suspense>
      <MiniCompanion key={`mini-${session}`} />
      <ReadAlong key={`read-${session}`} />
      <AtmosphereToggle />
      <ScrollProgress />
      <Navbar />
      <DesktopHint />
      <Hero />
      <About />
      <Experience />
      <Sphere />
      <Projects />
      <ContactUs />
    </div>
  )
}

export default App;
