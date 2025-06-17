import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/providers/theme-provider'
import { AuthProvider } from '@/providers/auth-provider'
import { MobileLayout } from '@/components/layout/mobile-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { LandingPage } from '@/pages/landing'
import { CoursesPage } from '@/pages/courses'
import { ProfilePage } from '@/pages/profile'
import { LoginPage } from '@/pages/auth/login'
import { SignUpPage } from '@/pages/auth/signup'
import { ForgotPasswordPage } from '@/pages/auth/forgot-password'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="orion-ui-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes - no sidebar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Main app routes - with universal sidebar */}
            <Route path="/" element={<MobileLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route 
                path="profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App