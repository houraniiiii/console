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
  email: 'admin@vertirix.com',
  name: 'System Administrator',
  role: 'admin',
  subscription: {
    tierId: 'enterprise',
    tierName: 'Enterprise',
    maxAgents: 5,
    usedAgents: 0
  },
  isActive: true,
  createdAt: new Date('2024-01-01'),
  company: 'Vertirix'
}

// Security utilities
const generateUserId = () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
const hashPassword = (password: string) => {
  // In production, use proper bcrypt or similar
  return btoa(password + 'vertirix-salt-2024')
}
const verifyPassword = (password: string, hash: string) => {
  return hashPassword(password) === hash
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
  }, [])

  const initializeAuth = async () => {
    try {
      // Ensure default admin exists
      const users = getStoredUsers()
      if (!users.find(u => u.email === DEFAULT_ADMIN.email)) {
        const updatedUsers = [...users, DEFAULT_ADMIN]
        localStorage.setItem('vertirix-users', JSON.stringify(updatedUsers))
        
        // Store admin password
        const passwords = getStoredPasswords()
        passwords[DEFAULT_ADMIN.email] = hashPassword('admin123')
        localStorage.setItem('vertirix-passwords', JSON.stringify(passwords))
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
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    localStorage.setItem('vertirix-session', JSON.stringify(sessionData))
  }

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const users = getStoredUsers()
      const passwords = getStoredPasswords()
      
      const user = users.find(u => u.email === credentials.email && u.isActive)
      
      if (!user || !verifyPassword(credentials.password, passwords[credentials.email])) {
        toast.error('Invalid email or password')
        return false
      }

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
        company: userData.company
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