import { useState, useEffect, useCallback } from 'react'
import { Agent, Campaign, Contact, ContactList, ConsoleStats, UserSubscription } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

// Predefined agents with enhanced technical configuration
const PREDEFINED_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Sales Agent Pro',
    description: 'Professional sales conversation specialist with advanced AI',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    ownerId: 'admin-1',
    assignedUsers: [],
    ec2Status: 'stopped',
    technicalConfig: {
      systemPrompt: 'You are a professional sales agent. Your goal is to engage prospects, understand their needs, and present solutions that match their requirements. Be friendly, professional, and persistent but not pushy.',
      stt: {
        provider: 'whisper',
        model: 'whisper-1',
        settings: {
          language: 'en-US',
          confidence_threshold: 0.8,
          silence_timeout: 2000
        }
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4-turbo',
        settings: {
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1.0,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        }
      },
      tts: {
        provider: 'elevenlabs',
        voiceId: 'professional-male-1',
        settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          speed: 1.0,
          pitch: 1.0
        }
      },
      callSettings: {
        max_call_duration: 300,
        call_timeout: 30,
        retry_attempts: 3,
        call_recording: true
      }
    },
    customerConfig: {
      voiceSpeed: 1.0,
      leadingMessage: 'Hello! I\'m calling to discuss an exciting opportunity that could benefit your business.',
      personality: 'Professional and persuasive',
      responseDelay: 1500,
      customInstructions: '',
      callHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    },
    schedule: {
      enabled: true,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5],
      autoActivate: true
    }
  },
  {
    id: 'agent-2',
    name: 'Support Agent 24/7',
    description: 'Customer service and support specialist available around the clock',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    ownerId: 'admin-1',
    assignedUsers: [],
    ec2Status: 'stopped',
    technicalConfig: {
      systemPrompt: 'You are a helpful customer support agent. Your role is to assist customers with their questions, resolve issues, and ensure they have a positive experience. Be patient, empathetic, and solution-focused.',
      stt: {
        provider: 'deepgram',
        model: 'nova-2',
        settings: {
          language: 'en-US',
          confidence_threshold: 0.7,
          silence_timeout: 1500
        }
      },
      llm: {
        provider: 'anthropic',
        model: 'claude-3-sonnet',
        settings: {
          temperature: 0.5,
          max_tokens: 800,
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        }
      },
      tts: {
        provider: 'azure',
        voiceId: 'friendly-female-1',
        settings: {
          stability: 0.7,
          similarity_boost: 0.9,
          speed: 1.1,
          pitch: 1.0
        }
      },
      callSettings: {
        max_call_duration: 600,
        call_timeout: 45,
        retry_attempts: 2,
        call_recording: true
      }
    },
    customerConfig: {
      voiceSpeed: 1.1,
      leadingMessage: 'Hi there! I\'m here to help you with any questions or concerns you might have.',
      personality: 'Helpful and patient',
      responseDelay: 1000,
      customInstructions: '',
      callHours: {
        start: '08:00',
        end: '20:00',
        timezone: 'UTC',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6]
      }
    },
    schedule: {
      enabled: true,
      startTime: '08:00',
      endTime: '20:00',
      timezone: 'UTC',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      autoActivate: true
    }
  },
  {
    id: 'agent-3',
    name: 'Lead Qualifier AI',
    description: 'Lead generation and qualification expert with intelligent scoring',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    ownerId: 'admin-1',
    assignedUsers: [],
    ec2Status: 'stopped',
    technicalConfig: {
      systemPrompt: 'You are a lead qualification specialist. Your goal is to identify potential customers, understand their needs, and qualify them based on budget, authority, need, and timeline. Be engaging and build rapport while gathering information.',
      stt: {
        provider: 'google',
        model: 'latest',
        settings: {
          language: 'en-US',
          confidence_threshold: 0.75,
          silence_timeout: 1800
        }
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4-turbo',
        settings: {
          temperature: 0.6,
          max_tokens: 900,
          top_p: 0.95,
          frequency_penalty: 0.05,
          presence_penalty: 0.05
        }
      },
      tts: {
        provider: 'google',
        voiceId: 'professional-neutral-1',
        settings: {
          stability: 0.65,
          similarity_boost: 0.85,
          speed: 1.05,
          pitch: 1.0
        }
      },
      callSettings: {
        max_call_duration: 420,
        call_timeout: 35,
        retry_attempts: 3,
        call_recording: true
      }
    },
    customerConfig: {
      voiceSpeed: 1.05,
      leadingMessage: 'Good day! I\'d like to learn more about your business needs and see how we can help.',
      personality: 'Engaging and inquisitive',
      responseDelay: 1800,
      customInstructions: '',
      callHours: {
        start: '10:00',
        end: '16:00',
        timezone: 'UTC',
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    },
    schedule: {
      enabled: false,
      startTime: '10:00',
      endTime: '16:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5],
      autoActivate: false
    }
  },
  {
    id: 'agent-4',
    name: 'Follow-up Specialist',
    description: 'Customer follow-up and retention specialist with personalized approach',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    ownerId: 'admin-1',
    assignedUsers: [],
    ec2Status: 'stopped',
    technicalConfig: {
      systemPrompt: 'You are a follow-up specialist focused on maintaining relationships and driving conversions. Be warm, personal, and reference previous interactions. Your goal is to move prospects through the sales funnel.',
      stt: {
        provider: 'azure',
        model: 'latest',
        settings: {
          language: 'en-US',
          confidence_threshold: 0.7,
          silence_timeout: 2200
        }
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4',
        settings: {
          temperature: 0.8,
          max_tokens: 850,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        }
      },
      tts: {
        provider: 'elevenlabs',
        voiceId: 'warm-friendly-1',
        settings: {
          stability: 0.8,
          similarity_boost: 0.9,
          speed: 0.95,
          pitch: 1.0
        }
      },
      callSettings: {
        max_call_duration: 360,
        call_timeout: 40,
        retry_attempts: 2,
        call_recording: true
      }
    },
    customerConfig: {
      voiceSpeed: 0.95,
      leadingMessage: 'Hello! I\'m following up on our previous conversation to see how things are going.',
      personality: 'Friendly and persistent',
      responseDelay: 2200,
      customInstructions: '',
      callHours: {
        start: '14:00',
        end: '18:00',
        timezone: 'UTC',
        daysOfWeek: [2, 4]
      }
    },
    schedule: {
      enabled: true,
      startTime: '14:00',
      endTime: '18:00',
      timezone: 'UTC',
      daysOfWeek: [2, 4],
      autoActivate: true
    }
  },
  {
    id: 'agent-5',
    name: 'Arabic Voice Agent',
    description: 'Arabic-speaking customer engagement specialist with cultural awareness',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    ownerId: 'admin-1',
    assignedUsers: [],
    ec2Status: 'stopped',
    technicalConfig: {
      systemPrompt: 'أنت وكيل خدمة عملاء يتحدث العربية. هدفك هو مساعدة العملاء وتقديم الدعم بطريقة مهذبة ومحترمة. كن صبوراً ومتفهماً واحرص على التواصل الفعال.',
      stt: {
        provider: 'azure',
        model: 'ar-latest',
        settings: {
          language: 'ar',
          confidence_threshold: 0.75,
          silence_timeout: 2000
        }
      },
      llm: {
        provider: 'openai',
        model: 'gpt-4-turbo',
        settings: {
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          frequency_penalty: 0.0,
          presence_penalty: 0.0
        }
      },
      tts: {
        provider: 'azure',
        voiceId: 'ar-professional-1',
        settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          speed: 1.0,
          pitch: 1.0
        }
      },
      callSettings: {
        max_call_duration: 450,
        call_timeout: 45,
        retry_attempts: 3,
        call_recording: true
      }
    },
    customerConfig: {
      voiceSpeed: 1.0,
      leadingMessage: 'السلام عليكم! أتصل بكم لمناقشة فرصة رائعة قد تفيد أعمالكم.',
      personality: 'Respectful and culturally aware',
      responseDelay: 2000,
      customInstructions: '',
      callHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
        daysOfWeek: [0, 1, 2, 3, 4]
      }
    }
  }
]

// Subscription tiers
const SUBSCRIPTION_TIERS = {
  'basic': { maxAgents: 1, tierName: 'Basic' },
  'starter': { maxAgents: 2, tierName: 'Starter' },
  'professional': { maxAgents: 3, tierName: 'Professional' },
  'enterprise': { maxAgents: 5, tierName: 'Enterprise' }
}

export function useConsoleData() {
  const { user } = useAuth()
  const [agents, setAgents] = useState<Agent[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [contactLists, setContactLists] = useState<ContactList[]>([])
  const [stats, setStats] = useState<ConsoleStats>({
    totalCalls: 0,
    successRate: 0,
    avgDuration: '0m 0s',
    activeCampaigns: 0,
    activeAgents: 0,
    totalContacts: 0
  })

  // Get user-specific storage keys
  const getUserKey = (key: string) => user ? `vertirix-${key}-${user.id}` : `vertirix-${key}`

  // Load data from localStorage on mount
  useEffect(() => {
    if (!user) return

    const savedAgents = localStorage.getItem(getUserKey('agents'))
    const savedCampaigns = localStorage.getItem(getUserKey('campaigns'))
    const savedContactLists = localStorage.getItem(getUserKey('contactLists'))

    if (savedAgents) {
      setAgents(JSON.parse(savedAgents))
    } else {
      // Initialize with predefined agents for new users (filtered by user access)
      const userAgents = PREDEFINED_AGENTS.filter(agent => 
        agent.assignedUsers.includes(user.id) || user.role === 'admin'
      )
      setAgents(userAgents)
    }

    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns))
    }
    
    if (savedContactLists) {
      setContactLists(JSON.parse(savedContactLists))
    }
  }, [user])

  // Save data to localStorage when state changes
  useEffect(() => {
    if (!user) return
    localStorage.setItem(getUserKey('agents'), JSON.stringify(agents))
    updateStats()
  }, [agents, user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(getUserKey('campaigns'), JSON.stringify(campaigns))
    updateStats()
  }, [campaigns, user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(getUserKey('contactLists'), JSON.stringify(contactLists))
    updateStats()
  }, [contactLists, user])

  // Update stats based on current data
  const updateStats = useCallback(() => {
    const activeAgents = agents.filter(agent => agent.status === 'active').length
    const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length
    const totalContacts = contactLists.reduce((sum, list) => sum + list.totalContacts, 0)
    const totalCalls = campaigns.reduce((sum, campaign) => sum + campaign.stats.contactsCalled, 0)
    const successfulCalls = campaigns.reduce((sum, campaign) => sum + campaign.stats.successfulCalls, 0)
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0

    setStats({
      totalCalls,
      successRate,
      avgDuration: '2m 34s', // This would be calculated from call records
      activeCampaigns,
      activeAgents,
      totalContacts
    })
  }, [agents, campaigns, contactLists])

  // Get available agents based on user subscription and role
  const getAvailableAgents = useCallback(() => {
    if (!user) return []
    
    if (user.role === 'admin') {
      return agents // Admins see all agents
    }
    
    // Regular users only see assigned agents
    const assignedAgents = agents.filter(agent => 
      agent.assignedUsers.includes(user.id)
    )
    
    return assignedAgents.slice(0, user.subscription.maxAgents)
  }, [agents, user])

  // Agent operations (customers can only update customerConfig)
  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id !== id) return agent
      
      // Restrict customer updates to customerConfig only
      if (user?.role !== 'admin' && updates.technicalConfig) {
        const { technicalConfig, ...allowedUpdates } = updates
        return { ...agent, ...allowedUpdates, lastUsed: new Date() }
      }
      
      return { ...agent, ...updates, lastUsed: new Date() }
    }))
  }, [user])

  // Campaign CRUD operations
  const createCampaign = useCallback((campaignData: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `campaign-${Date.now()}`,
      userId: user!.id,
      stats: {
        totalContacts: 0,
        contactsCalled: 0,
        successfulCalls: 0,
        failedCalls: 0,
        pendingCalls: 0,
        averageCallDuration: 0,
        successRate: 0
      },
      createdAt: new Date()
    }
    setCampaigns(prev => [...prev, newCampaign])
    return newCampaign
  }, [user])

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ))
  }, [])

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
  }, [])

  // Contact List operations
  const addContactList = useCallback((listData: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContactList: ContactList = {
      ...listData,
      id: `contactlist-${Date.now()}`,
      userId: user!.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setContactLists(prev => [...prev, newContactList])
    return newContactList
  }, [user])

  const updateContactList = useCallback((id: string, updates: Partial<ContactList>) => {
    setContactLists(prev => prev.map(list => 
      list.id === id ? { ...list, ...updates, updatedAt: new Date() } : list
    ))
  }, [])

  const deleteContactList = useCallback((id: string) => {
    setContactLists(prev => prev.filter(list => list.id !== id))
  }, [])

  // Check if agent should be active based on schedule
  const isAgentScheduledActive = useCallback((agent: Agent) => {
    if (!agent.schedule?.enabled) return false
    
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.getDay()
    
    const isInScheduledDays = agent.schedule.daysOfWeek.includes(currentDay)
    const isInTimeRange = currentTime >= agent.schedule.startTime && currentTime <= agent.schedule.endTime
    
    return isInScheduledDays && isInTimeRange
  }, [])

  // Auto-activate agents based on schedule
  useEffect(() => {
    const checkSchedules = () => {
      setAgents(prev => prev.map(agent => {
        if (agent.schedule?.enabled && agent.schedule.autoActivate) {
          const shouldBeActive = isAgentScheduledActive(agent)
          if (shouldBeActive && agent.status === 'scheduled') {
            return { ...agent, status: 'active' as const }
          } else if (!shouldBeActive && agent.status === 'active' && agent.schedule) {
            return { ...agent, status: 'scheduled' as const }
          }
        }
        return agent
      }))
    }

    const interval = setInterval(checkSchedules, 60000)
    checkSchedules()

    return () => clearInterval(interval)
  }, [isAgentScheduledActive])

  return {
    // Data
    agents: getAvailableAgents(),
    campaigns: campaigns.filter(c => c.userId === user?.id), // Filter user's campaigns
    contactLists: contactLists.filter(cl => cl.userId === user?.id), // Filter user's contact lists
    stats,
    
    // Agent operations
    updateAgent,
    
    // Campaign operations
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    // Contact List operations
    addContactList,
    updateContactList,
    deleteContactList
  }
} 