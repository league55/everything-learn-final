import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { MainLayout } from '@/components/layout/main-layout'
import { LandingPage } from '@/pages/landing'
import { CoursesPage } from '@/pages/courses'
import { ProfilePage } from '@/pages/profile'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="orion-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  )
}

export default App