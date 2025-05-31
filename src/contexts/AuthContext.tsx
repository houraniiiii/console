'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, AuthState, LoginCredentials, CreateUserRequest } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  createUser: (userData: CreateUserRequest) => Promise<boolean>
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>
  deleteUser: (userId: string) => Promise<boolean>
  getAllUsers: () => User[]
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default admin user
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  email: 'abdulla.hourani@vertirix.com',
  name: 'Abdulla Hourani',
  role: 'admin',
  subscription: {
    tierId: 'enterprise',
    tierName: 'Enterprise',
    maxAgents: 10,
    usedAgents: 0
  },
  isActive: true,
  createdAt: new Date(),
  company: 'Vertirix Systems',
  assignedAgents: [] // Admins can access all agents
}

// Security configuration
const SECURITY_CONFIG = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
  passwordMinLength: 12,
  requireSpecialChar: true
}

// Security utilities
const generateUserId = () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill remaining length with random characters
  for (let i = 4; i < 16; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

const hashPassword = (password: string) => {
  // In production, use proper bcrypt or similar
  const salt = 'vertirix-salt-2024-secure'
  let hash = 0
  const str = password + salt
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return btoa(hash.toString())
}

const verifyPassword = (password: string, hash: string) => {
  return hashPassword(password) === hash
}

const validatePasswordStrength = (password: string): string | null => {
  if (password.length < SECURITY_CONFIG.passwordMinLength) {
    return `Password must be at least ${SECURITY_CONFIG.passwordMinLength} characters long`
  }
  
  if (SECURITY_CONFIG.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number'
  }
  
  return null
}

const getLoginAttempts = (): Record<string, { count: number; lastAttempt: number }> => {
  const stored = localStorage.getItem('vertirix-login-attempts')
  return stored ? JSON.parse(stored) : {}
}

const setLoginAttempts = (attempts: Record<string, { count: number; lastAttempt: number }>) => {
  localStorage.setItem('vertirix-login-attempts', JSON.stringify(attempts))
}

const isAccountLocked = (email: string): boolean => {
  const attempts = getLoginAttempts()
  const userAttempts = attempts[email]
  
  if (!userAttempts) return false
  
  const isLocked = userAttempts.count >= SECURITY_CONFIG.maxLoginAttempts &&
                   Date.now() - userAttempts.lastAttempt < SECURITY_CONFIG.lockoutDuration
  
  return isLocked
}

const recordLoginAttempt = (email: string, success: boolean) => {
  const attempts = getLoginAttempts()
  
  if (success) {
    // Clear attempts on successful login
    delete attempts[email]
  } else {
    // Increment failed attempts
    if (!attempts[email]) {
      attempts[email] = { count: 0, lastAttempt: 0 }
    }
    attempts[email].count++
    attempts[email].lastAttempt = Date.now()
  }
  
  setLoginAttempts(attempts)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  })

  useEffect(() => {
    // Initialize default admin and restore session
    initializeAuth()
    
    // Set up session monitoring
    const sessionInterval = setInterval(checkSessionValidity, 60000) // Check every minute
    
    return () => clearInterval(sessionInterval)
  }, [])

  const checkSessionValidity = () => {
    const sessionToken = localStorage.getItem('vertirix-session')
    if (sessionToken && authState.isAuthenticated) {
      try {
        const sessionData = JSON.parse(sessionToken)
        if (sessionData.expiresAt <= Date.now()) {
          toast.error('Session expired. Please login again.')
          logout()
        }
      } catch (error) {
        console.error('Session validation error:', error)
        logout()
      }
    }
  }

  const initializeAuth = async () => {
    try {
      // Ensure default admin exists
      const users = getStoredUsers()
      const passwords = getStoredPasswords()
      
      if (!users.find(u => u.email === DEFAULT_ADMIN.email)) {
        // Use a fixed secure admin password for consistent access
        const adminPassword = 'Vertirix2024@Admin'
        
        const updatedUsers = [...users, DEFAULT_ADMIN]
        localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))
        
        // Store admin password
        passwords[DEFAULT_ADMIN.email] = hashPassword(adminPassword)
        localStorage.setItem('vertirix-passwords', JSON.stringify(passwords))
        
        // Log admin credentials for reference
        console.log('🔐 ADMIN ACCOUNT INITIALIZED')
        console.log('Email:', DEFAULT_ADMIN.email)
        console.log('✅ Admin account ready for login')
        
        // Show admin account created notification
        toast.success('Admin account initialized successfully!', { duration: 5000 })
      }

      // Restore session
      const sessionToken = localStorage.getItem('vertirix-session')
      if (sessionToken) {
        const sessionData = JSON.parse(sessionToken)
        const user = users.find(u => u.id === sessionData.userId)
        
        if (user && sessionData.expiresAt > Date.now()) {
          setAuthState({
            user: { ...user, lastLogin: new Date() },
            isAuthenticated: true,
            isLoading: false
          })
          return
        } else {
          localStorage.removeItem('vertirix-session')
          if (sessionData.expiresAt <= Date.now()) {
            toast.error('Session expired. Please login again.')
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }))
  }

  const getStoredUsers = (): User[] => {
    const stored = localStorage.getItem('vertirix-users')
    return stored ? JSON.parse(stored) : []
  }

  const getStoredPasswords = (): Record<string, string> => {
    const stored = localStorage.getItem('vertirix-passwords')
    return stored ? JSON.parse(stored) : {}
  }

  const createSession = (user: User) => {
    const sessionData = {
      userId: user.id,
      expiresAt: Date.now() + SECURITY_CONFIG.sessionDuration
    }
    localStorage.setItem('vertirix-session', JSON.stringify(sessionData))
  }

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Check if account is locked
      if (isAccountLocked(credentials.email)) {
        const lockTimeRemaining = Math.ceil(
          (SECURITY_CONFIG.lockoutDuration - (Date.now() - getLoginAttempts()[credentials.email]?.lastAttempt)) / 60000
        )
        toast.error(`Account locked. Try again in ${lockTimeRemaining} minutes.`)
        return false
      }

      const users = getStoredUsers()
      const passwords = getStoredPasswords()
      
      const user = users.find(u => u.email === credentials.email && u.isActive)
      
      if (!user || !verifyPassword(credentials.password, passwords[credentials.email])) {
        recordLoginAttempt(credentials.email, false)
        toast.error('Invalid email or password')
        return false
      }

      // Successful login
      recordLoginAttempt(credentials.email, true)

      // Update last login
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, lastLogin: new Date() } : u
      )
      localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))

      createSession(user)
      setAuthState({
        user: { ...user, lastLogin: new Date() },
        isAuthenticated: true,
        isLoading: false
      })

      toast.success(`Welcome back, ${user.name}!`)
      return true
    } catch (error) {
      toast.error('Login failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('vertirix-session')
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
    toast.success('Logged out successfully')
  }

  const createUser = async (userData: CreateUserRequest): Promise<boolean> => {
    try {
      if (authState.user?.role !== 'admin') {
        toast.error('Unauthorized: Admin access required')
        return false
      }

      // Validate password strength
      const passwordError = validatePasswordStrength(userData.password)
      if (passwordError) {
        toast.error(passwordError)
        return false
      }

      const users = getStoredUsers()
      const passwords = getStoredPasswords()

      // Check if email already exists
      if (users.find(u => u.email === userData.email)) {
        toast.error('Email already exists')
        return false
      }

      const newUser: User = {
        id: generateUserId(),
        email: userData.email,
        name: userData.name,
        role: 'user',
        subscription: {
          ...userData.subscription,
          usedAgents: 0
        },
        isActive: true,
        createdAt: new Date(),
        company: userData.company,
        assignedAgents: [] // New users start with no assigned agents
      }

      const updatedUsers = [...users, newUser]
      passwords[userData.email] = hashPassword(userData.password)

      localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))
      localStorage.setItem('vertirix-passwords', JSON.stringify(passwords))

      toast.success('User created successfully')
      return true
    } catch (error) {
      toast.error('Failed to create user')
      return false
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    try {
      if (authState.user?.role !== 'admin') {
        toast.error('Unauthorized: Admin access required')
        return false
      }

      const users = getStoredUsers()
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      )

      localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))
      toast.success('User updated successfully')
      return true
    } catch (error) {
      toast.error('Failed to update user')
      return false
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      if (authState.user?.role !== 'admin') {
        toast.error('Unauthorized: Admin access required')
        return false
      }

      if (userId === authState.user.id) {
        toast.error('Cannot delete your own account')
        return false
      }

      const users = getStoredUsers()
      const userToDelete = users.find(u => u.id === userId)
      
      if (!userToDelete) {
        toast.error('User not found')
        return false
      }

      const updatedUsers = users.filter(u => u.id !== userId)
      const passwords = getStoredPasswords()
      delete passwords[userToDelete.email]

      localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))
      localStorage.setItem('vertirix-passwords', JSON.stringify(passwords))

      toast.success('User deleted successfully')
      return true
    } catch (error) {
      toast.error('Failed to delete user')
      return false
    }
  }

  const getAllUsers = (): User[] => {
    if (authState.user?.role !== 'admin') return []
    return getStoredUsers()
  }

  const refreshAuth = async () => {
    await initializeAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        getAllUsers,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 