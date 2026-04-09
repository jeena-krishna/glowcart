import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('glowcart_token')
    const savedUser = localStorage.getItem('glowcart_user')

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('glowcart_token')
        localStorage.removeItem('glowcart_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await authAPI.login({ email, password })
    const { token, user: userData } = response.data
    localStorage.setItem('glowcart_token', token)
    localStorage.setItem('glowcart_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (firstName, lastName, email, password) => {
    const response = await authAPI.register({ firstName, lastName, email, password })
    const { token, user: userData } = response.data
    localStorage.setItem('glowcart_token', token)
    localStorage.setItem('glowcart_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('glowcart_token')
    localStorage.removeItem('glowcart_user')
    setUser(null)
  }

  const isAdmin = user?.role === 'ADMIN'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, isAdmin, isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}