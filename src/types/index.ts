export interface Agent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  createdAt: Date
  lastUsed?: Date
  configuration: {
    voice: 'hyper-realistic' | 'realistic' | 'custom' | 'professional' | 'standard'
    language: 'en-US' | 'ar'
    personality: string
    responseTime: number
    firstMessage: string
  }
}

export interface Campaign {
  id: string
  name: string
  agentId: string
  status: 'active' | 'paused' | 'completed' | 'draft'
  contactsCalled: number
  totalContacts: number
  successRate: number
  createdAt: Date
  startDate?: Date
  endDate?: Date
  nextCallTime?: Date
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  status: 'pending' | 'called' | 'success' | 'failed'
  lastCallResult?: string
  createdAt: Date
}

export interface ConsoleStats {
  totalCalls: number
  successRate: number
  avgDuration: string
  activeCampaigns: number
  activeAgents: number
  totalContacts: number
}

export interface InstanceStatus {
  isRunning: boolean
  uptime: string
  todayCost: number
  monthlyProjection: number
  lastStopped?: Date
}

export interface SubscriptionTier {
  id: string
  name: string
  maxAgents: number
  features: string[]
  price: number
}

export interface UserSubscription {
  tierId: string
  tierName: string
  maxAgents: number
  usedAgents: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  subscription: UserSubscription
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
  company?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
  company?: string
  subscription: {
    tierId: string
    tierName: string
    maxAgents: number
  }
} 