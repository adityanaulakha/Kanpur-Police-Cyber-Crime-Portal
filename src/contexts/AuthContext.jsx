import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Default credentials (in production, this should be in a secure backend)
const VALID_CREDENTIALS = {
  email: 'admin@kanpurpolice.gov.in',
  password: 'Kanpur@2026'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('kanpur_police_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        localStorage.removeItem('kanpur_police_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      const userData = { email, loginTime: new Date().toISOString() }
      setUser(userData)
      localStorage.setItem('kanpur_police_user', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Invalid email or password' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('kanpur_police_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
