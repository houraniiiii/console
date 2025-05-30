'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Agent, User, CreateUserRequest } from '@/types'
import { 
  Plus, 
  Users, 
  Bot, 
  Settings, 
  ArrowLeft, 
  Server, 
  Database, 
  Mic, 
  MessageSquare,
  Crown,
  Eye,
  EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import SecurityMonitor from '@/components/SecurityMonitor'

export default function AdminPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'create-agent'>('users')

  // Create Agent Form State
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    stt: {
      provider: 'whisper' as const,
      model: 'whisper-1',
      settings: {
        language: 'en-US',
        confidence_threshold: 0.7,
        silence_timeout: 2000
      }
    },
    llm: {
      provider: 'openai' as const,
      model: 'gpt-4-turbo',
      settings: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      }
    },
    tts: {
      provider: 'elevenlabs' as const,
      voiceId: '',
      settings: {
        stability: 0.5,
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
    },
    customerConfig: {
      voiceSpeed: 1.0,
      leadingMessage: '',
      personality: '',
      responseDelay: 1000,
      customInstructions: '',
      callHours: {
        start: '09:00',
        end: '17:00',
        timezone: 'UTC',
        daysOfWeek: [1, 2, 3, 4, 5]
      }
    }
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login')
      return
    }
    loadData()
  }, [user, router])

  const loadData = async () => {
    // Load users and agents from localStorage or API
    const savedUsers = localStorage.getItem('admin-users')
    const savedAgents = localStorage.getItem('admin-agents')
    
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedAgents) setAgents(JSON.parse(savedAgents))
  }

  const handleCreateAgent = async () => {
    if (!agentForm.name.trim() || !agentForm.description.trim() || !agentForm.systemPrompt.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        name: agentForm.name,
        description: agentForm.description,
        status: 'provisioning',
        createdAt: new Date(),
        ownerId: user!.id,
        assignedUsers: [],
        ec2Status: 'pending',
        technicalConfig: {
          systemPrompt: agentForm.systemPrompt,
          stt: agentForm.stt,
          llm: agentForm.llm,
          tts: agentForm.tts,
          callSettings: agentForm.callSettings
        },
        customerConfig: agentForm.customerConfig
      }

      const updatedAgents = [...agents, newAgent]
      setAgents(updatedAgents)
      localStorage.setItem('admin-agents', JSON.stringify(updatedAgents))
      
      toast.success('Agent created successfully! EC2 instance is being provisioned.')
      
      // Reset form
      setAgentForm(prev => ({
        ...prev,
        name: '',
        description: '',
        systemPrompt: '',
        customerConfig: {
          ...prev.customerConfig,
          leadingMessage: '',
          personality: '',
          customInstructions: ''
        }
      }))
      
      setActiveTab('agents')
    } catch (error) {
      toast.error('Failed to create agent')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      router.push('/login')
    }
  }

  const renderCreateAgentForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('agents')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Create New Agent</h2>
            <p className="text-gray-400">Configure technical specifications and customer settings</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-400" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Agent Name *</label>
              <input
                type="text"
                value={agentForm.name}
                onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Sales Agent Pro"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
              <textarea
                value={agentForm.description}
                onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description of the agent's purpose..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt *</label>
              <textarea
                value={agentForm.systemPrompt}
                onChange={(e) => setAgentForm({ ...agentForm, systemPrompt: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="You are a professional sales agent. Your goal is to..."
              />
            </div>
          </div>
        </div>

        {/* STT Configuration */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Mic className="w-5 h-5 mr-2 text-green-400" />
            Speech-to-Text (STT)
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
              <select
                value={agentForm.stt.provider}
                onChange={(e) => setAgentForm({
                  ...agentForm,
                  stt: { ...agentForm.stt, provider: e.target.value as any }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="whisper">OpenAI Whisper</option>
                <option value="deepgram">Deepgram</option>
                <option value="azure">Azure Speech</option>
                <option value="google">Google Speech</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
              <input
                type="text"
                value={agentForm.stt.model}
                onChange={(e) => setAgentForm({
                  ...agentForm,
                  stt: { ...agentForm.stt, model: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setActiveTab('agents')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateAgent}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Agent'}
        </button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gray-850/50 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">Manage agents and customers</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 rounded-lg">
              <Crown className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-400">Admin</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Security Monitor for Admins */}
      <SecurityMonitor />

      {/* Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium ${activeTab === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Users
        </button>
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-6 py-3 font-medium ${activeTab === 'agents' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          <Bot className="w-4 h-4 inline mr-2" />
          Agents
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'create-agent' && renderCreateAgentForm()}
        {activeTab === 'agents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Voice Agents</h2>
              <button
                onClick={() => setActiveTab('create-agent')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Agent
              </button>
            </div>
            
            <div className="grid gap-4">
              {agents.map((agent) => (
                <div key={agent.id} className="dashboard-card rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                      <p className="text-gray-400 mb-2">{agent.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          agent.status === 'active' ? 'bg-green-400/20 text-green-400' :
                          agent.status === 'provisioning' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {agent.status}
                        </span>
                        <span className="text-gray-500">
                          EC2: {agent.ec2Status || 'Unknown'}
                        </span>
                        <span className="text-gray-500">
                          Assigned to: {agent.assignedUsers.length} users
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors">
                      Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Customer Users</h2>
            <div className="text-gray-400">User management interface will be implemented here...</div>
          </div>
        )}
      </div>
    </div>
  )
} 