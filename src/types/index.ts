export interface Agent {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'scheduled' | 'provisioning' | 'error'
  createdAt: Date
  lastUsed?: Date
  ownerId: string // Admin who created this agent
  assignedUsers: string[] // Customer IDs who have access
  ec2InstanceId?: string
  ec2Status?: 'running' | 'stopped' | 'starting' | 'stopping' | 'pending'
  
  // Admin-only technical configuration
  technicalConfig: {
    systemPrompt: string
    stt: {
      provider: 'whisper' | 'deepgram' | 'azure' | 'google'
      model: string
      settings: {
        language: string
        confidence_threshold: number
        silence_timeout: number
      }
    }
    llm: {
      provider: 'openai' | 'anthropic' | 'azure' | 'cohere'
      model: string
      settings: {
        temperature: number
        max_tokens: number
        top_p: number
        frequency_penalty: number
        presence_penalty: number
      }
    }
    tts: {
      provider: 'elevenlabs' | 'azure' | 'google' | 'openai'
      voiceId: string
      settings: {
        stability: number
        similarity_boost: number
        speed: number
        pitch: number
      }
    }
    callSettings: {
      max_call_duration: number // seconds
      call_timeout: number // seconds
      retry_attempts: number
      call_recording: boolean
    }
  }
  
  // Customer-editable configuration
  customerConfig: {
    voiceSpeed: number // 0.5 to 2.0
    leadingMessage: string
    personality: string
    responseDelay: number // milliseconds
    customInstructions: string
    callHours: {
      start: string // HH:MM
      end: string // HH:MM
      timezone: string
      daysOfWeek: number[]
    }
  }
  
  schedule?: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
    daysOfWeek: number[]
    autoActivate: boolean
  }
}

export interface Campaign {
  id: string
  name: string
  agentId: string
  contactListId: string
  userId: string // Customer who owns this campaign
  status: 'active' | 'paused' | 'completed' | 'draft' | 'scheduled'
  
  // Call scheduling
  callSettings: {
    callsPerMinute: number
    startTime: string // HH:MM
    endTime: string // HH:MM
    timezone: string
    daysOfWeek: number[]
    maxAttempts: number
    retryDelay: number // hours
  }
  
  // Statistics
  stats: {
    totalContacts: number
    contactsCalled: number
    successfulCalls: number
    failedCalls: number
    pendingCalls: number
    averageCallDuration: number
    successRate: number
  }
  
  createdAt: Date
  startDate?: Date
  endDate?: Date
  lastCallTime?: Date
  nextCallTime?: Date
}

export interface ContactList {
  id: string
  name: string
  userId: string
  contacts: Contact[]
  createdAt: Date
  updatedAt: Date
  totalContacts: number
  validContacts: number
  invalidContacts: number
}

export interface Contact {
  id: string
  name: string
  phone: string
  email?: string
  company?: string
  customFields: { [key: string]: string }
  status: 'pending' | 'called' | 'success' | 'failed' | 'busy' | 'no_answer' | 'invalid'
  callHistory: CallRecord[]
  lastCallResult?: string
  createdAt: Date
  updatedAt: Date
}

export interface CallRecord {
  id: string
  contactId: string
  agentId: string
  campaignId: string
  status: 'completed' | 'failed' | 'busy' | 'no_answer' | 'error'
  duration: number // seconds
  recording_url?: string
  transcript?: string
  outcome: 'success' | 'callback' | 'not_interested' | 'error' | 'other'
  notes?: string
  timestamp: Date
}

export interface CSVUploadResult {
  total: number
  valid: number
  invalid: number
  errors: string[]
  preview: Contact[]
}

export interface ConsoleStats {
  totalCalls: number
  successRate: number
  avgDuration: string
  activeCampaigns: number
  activeAgents: number
  totalContacts: number
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
  assignedAgents: string[] // Agent IDs this user has access to
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