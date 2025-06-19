import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Dynamic domain detection for cookie storage
function getCookieDomain(): string {
  if (typeof window === 'undefined') return ''
  
  const hostname = window.location.hostname
  // For localhost and IP addresses, don't set domain
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^[\d.]+$/)) {
    return ''
  }
  if (hostname.includes('everythinglearn.online')) {
    return '.everythinglearn.online'
  }
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  return ''
}

const customStorage = {
  getItem: (key: string) => {
    try {
      const cookies = document.cookie.split(';')
      const cookie = cookies.find(c => c.trim().startsWith(`${key}=`))
      return cookie ? decodeURIComponent(cookie.split('=')[1]) : null
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      const domain = getCookieDomain()
      let attributes = 'path=/; samesite=lax; max-age=31536000'
      if (domain) attributes += `; domain=${domain}`
      if (window.location.protocol === 'https:') attributes += '; secure'
      document.cookie = `${key}=${encodeURIComponent(value)}; ${attributes}`
    } catch {}
  },
  removeItem: (key: string) => {
    try {
      const domain = getCookieDomain()
      let attributes = 'path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax'
      if (domain) attributes += `; domain=${domain}`
      if (window.location.protocol === 'https:') attributes += '; secure'
      document.cookie = `${key}=; ${attributes}`
    } catch {}
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'sb-auth-token',
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}) 