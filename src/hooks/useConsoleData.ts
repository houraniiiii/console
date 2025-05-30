import { useState, useEffect, useCallback } from 'react'
import { Agent, Campaign, Contact, ConsoleStats, InstanceStatus, UserSubscription } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

// Predefined agents available based on subscription
const PREDEFINED_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    name: 'Sales Agent',
    description: 'Professional sales conversation specialist',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    configuration: {
      voice: 'professional',
      language: 'en-US',
      personality: 'Professional and persuasive',
      responseTime: 2000,
      firstMessage: 'Hello! I\'m calling to discuss an exciting opportunity that could benefit your business.'
    }
  },
  {
    id: 'agent-2',
    name: 'Support Agent',
    description: 'Customer service and support specialist',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    configuration: {
      voice: 'realistic',
      language: 'en-US',
      personality: 'Helpful and patient',
      responseTime: 1500,
      firstMessage: 'Hi there! I\'m here to help you with any questions or concerns you might have.'
    }
  },
  {
    id: 'agent-3',
    name: 'Lead Qualifier',
    description: 'Lead generation and qualification expert',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    configuration: {
      voice: 'hyper-realistic',
      language: 'en-US',
      personality: 'Engaging and inquisitive',
      responseTime: 1800,
      firstMessage: 'Good day! I\'d like to learn more about your business needs and see how we can help.'
    }
  },
  {
    id: 'agent-4',
    name: 'Follow-up Agent',
    description: 'Customer follow-up and retention specialist',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    configuration: {
      voice: 'standard',
      language: 'en-US',
      personality: 'Friendly and persistent',
      responseTime: 2200,
      firstMessage: 'Hello! I\'m following up on our previous conversation to see how things are going.'
    }
  },
  {
    id: 'agent-5',
    name: 'Arabic Agent',
    description: 'Arabic-speaking customer engagement specialist',
    status: 'inactive',
    createdAt: new Date('2024-01-01'),
    configuration: {
      voice: 'realistic',
      language: 'ar',
      personality: 'Respectful and culturally aware',
      responseTime: 2000,
      firstMessage: 'السلام عليكم! أتصل بكم لمناقشة فرصة رائعة قد تفيد أعمالكم.'
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
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ConsoleStats>({
    totalCalls: 0,
    successRate: 0,
    avgDuration: '0m 0s',
    activeCampaigns: 0,
    activeAgents: 0,
    totalContacts: 0
  })
  const [instanceStatus, setInstanceStatus] = useState<InstanceStatus>({
    isRunning: false,
    uptime: '0m',
    todayCost: 0,
    monthlyProjection: 0
  })

  // Get user-specific storage keys
  const getUserKey = (key: string) => user ? `vertirix-${key}-${user.id}` : `vertirix-${key}`

  // Load data from localStorage on mount
  useEffect(() => {
    if (!user) return

    const savedAgents = localStorage.getItem(getUserKey('agents'))
    const savedCampaigns = localStorage.getItem(getUserKey('campaigns'))
    const savedContacts = localStorage.getItem(getUserKey('contacts'))
    const savedInstance = localStorage.getItem(getUserKey('instance'))

    if (savedAgents) {
      setAgents(JSON.parse(savedAgents))
    } else {
      // Initialize with predefined agents for new users
      setAgents(PREDEFINED_AGENTS)
    }

    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns))
    }
    
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts))
    }
    
    if (savedInstance) {
      setInstanceStatus(JSON.parse(savedInstance))
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
    localStorage.setItem(getUserKey('contacts'), JSON.stringify(contacts))
    updateStats()
  }, [contacts, user])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(getUserKey('instance'), JSON.stringify(instanceStatus))
  }, [instanceStatus, user])

  // Update stats based on current data
  const updateStats = useCallback(() => {
    const activeAgents = agents.filter(agent => agent.status === 'active').length
    const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active').length
    const totalCalls = campaigns.reduce((sum, campaign) => sum + campaign.contactsCalled, 0)
    const successfulCalls = campaigns.reduce((sum, campaign) => 
      sum + Math.round(campaign.contactsCalled * (campaign.successRate / 100)), 0
    )
    const successRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0

    setStats({
      totalCalls,
      successRate,
      avgDuration: '0m 0s',
      activeCampaigns,
      activeAgents,
      totalContacts: contacts.length
    })
  }, [agents, campaigns, contacts])

  // Get available agents based on user subscription
  const getAvailableAgents = useCallback(() => {
    if (!user) return []
    return agents.slice(0, user.subscription.maxAgents)
  }, [agents, user])

  // Agent operations (update only, no create/delete)
  const updateAgent = useCallback((id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    ))
  }, [])

  // Campaign CRUD operations
  const createCampaign = useCallback((campaignData: Omit<Campaign, 'id' | 'createdAt'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date()
    }
    setCampaigns(prev => [...prev, newCampaign])
    return newCampaign
  }, [])

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(campaign => 
      campaign.id === id ? { ...campaign, ...updates } : campaign
    ))
  }, [])

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(campaign => campaign.id !== id))
  }, [])

  // Contact operations
  const addContacts = useCallback((contactList: Omit<Contact, 'id' | 'createdAt'>[]) => {
    const newContacts: Contact[] = contactList.map(contact => ({
      ...contact,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    }))
    setContacts(prev => [...prev, ...newContacts])
    return newContacts
  }, [])

  // Instance control
  const toggleInstance = useCallback(() => {
    setInstanceStatus(prev => ({
      ...prev,
      isRunning: !prev.isRunning,
      lastStopped: !prev.isRunning ? undefined : new Date()
    }))
  }, [])

  // Subscription management - this would typically sync with the auth context
  const updateSubscription = useCallback((tierId: 'basic' | 'starter' | 'professional' | 'enterprise') => {
    // In a real app, this would be handled by the auth context and backend
    console.log('Subscription update would be handled by auth system:', tierId)
  }, [])

  return {
    // Data
    agents: getAvailableAgents(),
    campaigns,
    contacts,
    stats,
    instanceStatus,
    
    // Agent operations (only update)
    updateAgent,
    
    // Campaign operations
    createCampaign,
    updateCampaign,
    deleteCampaign,
    
    // Contact operations
    addContacts,
    
    // Instance operations
    toggleInstance,
    
    // Subscription operations
    updateSubscription
  }
} 