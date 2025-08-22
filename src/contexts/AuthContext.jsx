import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userData = localStorage.getItem('userData')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Simulate API call - replace with real authentication
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const user = storedUsers.find(u => u.email === email && u.password === password)
      
      if (!user) {
        throw new Error('Invalid email or password')
      }

      // Generate a simple token (in production, this comes from your backend)
      const token = btoa(JSON.stringify({ userId: user.id, email: user.email, timestamp: Date.now() }))
      
      // Store auth data
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }))

      setUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      // Simulate API call - replace with real registration
      const { firstName, lastName, email, password } = userData
      
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const existingUser = storedUsers.find(u => u.email === email)
      
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString()
      }

      // Store user
      storedUsers.push(newUser)
      localStorage.setItem('registeredUsers', JSON.stringify(storedUsers))

      // Auto-login after registration
      const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, timestamp: Date.now() }))
      
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }))

      setUser({
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    setUser(null)
  }

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem('authToken')
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
