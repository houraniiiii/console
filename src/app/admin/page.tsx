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
  EyeOff,
  Shield,
  Activity,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
  Key,
  Lock,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import SecurityMonitor from '@/components/SecurityMonitor'

export default function AdminPage() {
  const router = useRouter()
  const { user, logout, getAllUsers, createUser, updateUser, deleteUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'agents' | 'create-agent' | 'security'>('users')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedAgentForAssignment, setSelectedAgentForAssignment] = useState<string | null>(null)

  // Create User Form State
  const [userForm, setUserForm] = useState({
    email: '',
    name: '',
    password: '',
    company: '',
    tierId: 'basic',
    maxAgents: 1
  })

  // Create Agent Form State
  const [agentForm, setAgentForm] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    assignedUserId: '',
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
    setIsLoading(true)
    try {
      // Load users
      const allUsers = getAllUsers()
      setUsers(allUsers.filter(u => u.role !== 'admin')) // Don't show admin in user list
      
      // Load agents
      const savedAgents = localStorage.getItem('admin-agents')
      if (savedAgents) {
        setAgents(JSON.parse(savedAgents))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.name || !userForm.password) {
      toast.error('Please fill in all required fields')
      return
    }

    const tierMap = {
      'basic': { tierId: 'basic', tierName: 'Basic', maxAgents: 1 },
      'starter': { tierId: 'starter', tierName: 'Starter', maxAgents: 2 },
      'professional': { tierId: 'professional', tierName: 'Professional', maxAgents: 3 },
      'enterprise': { tierId: 'enterprise', tierName: 'Enterprise', maxAgents: 5 }
    }

    const createRequest: CreateUserRequest = {
      email: userForm.email,
      name: userForm.name,
      password: userForm.password,
      company: userForm.company,
      subscription: tierMap[userForm.tierId as keyof typeof tierMap]
    }

    const success = await createUser(createRequest)
    if (success) {
      setShowCreateUserModal(false)
      loadData()
      setUserForm({
        email: '',
        name: '',
        password: '',
        company: '',
        tierId: 'basic',
        maxAgents: 1
      })
    }
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
        assignedUsers: agentForm.assignedUserId ? [agentForm.assignedUserId] : [],
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
      
      // Update user's assignedAgents if a user was selected
      if (agentForm.assignedUserId) {
        const userToUpdate = users.find(u => u.id === agentForm.assignedUserId)
        if (userToUpdate) {
          await updateUser(userToUpdate.id, {
            assignedAgents: [...(userToUpdate.assignedAgents || []), newAgent.id]
          })
          loadData()
        }
      }
      
      toast.success('Agent created successfully! EC2 instance is being provisioned.')
      
      // Reset form
      setAgentForm(prev => ({
        ...prev,
        name: '',
        description: '',
        systemPrompt: '',
        assignedUserId: '',
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

  const handleAssignAgent = async (agentId: string, userId: string | null) => {
    const agent = agents.find(a => a.id === agentId)
    if (!agent) return

    // Remove agent from previous user
    const previousUser = users.find(u => u.assignedAgents?.includes(agentId))
    if (previousUser) {
      await updateUser(previousUser.id, {
        assignedAgents: previousUser.assignedAgents.filter(id => id !== agentId)
      })
    }

    // Update agent assignment
    const updatedAgent = {
      ...agent,
      assignedUsers: userId ? [userId] : []
    }

    const updatedAgents = agents.map(a => a.id === agentId ? updatedAgent : a)
    setAgents(updatedAgents)
    localStorage.setItem('admin-agents', JSON.stringify(updatedAgents))

    // Add agent to new user
    if (userId) {
      const newUser = users.find(u => u.id === userId)
      if (newUser) {
        await updateUser(userId, {
          assignedAgents: [...(newUser.assignedAgents || []), agentId]
        })
      }
    }

    toast.success('Agent assignment updated')
    setSelectedAgentForAssignment(null)
    loadData()
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await deleteUser(userId)
      if (success) {
        loadData()
      }
    }
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      router.push('/login')
    }
  }

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <button
          onClick={() => setShowCreateUserModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      <div className="dashboard-card rounded-xl p-6">
        <div className="grid gap-4">
          {users.map((user) => (
            <div key={user.id} className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="text-gray-300">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Company</p>
                      <p className="text-gray-300">{user.company || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Plan</p>
                      <p className="text-gray-300">{user.subscription.tierName} ({user.subscription.maxAgents} agents)</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned Agents</p>
                      <p className="text-gray-300">{user.assignedAgents?.length || 0} of {user.subscription.maxAgents}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                    {user.lastLogin && <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No users created yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderAgentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Voice Agent Management</h2>
        <button
          onClick={() => setActiveTab('create-agent')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Agent
        </button>
      </div>
      
      <div className="grid gap-4">
        {agents.map((agent) => {
          const assignedUser = users.find(u => u.assignedAgents?.includes(agent.id))
          
          return (
            <div key={agent.id} className="dashboard-card rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <p className="text-gray-400 mb-2">{agent.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        agent.status === 'active' ? 'bg-green-400/20 text-green-400' :
                        agent.status === 'provisioning' ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                      <span className="text-gray-500 text-sm">
                        EC2: {agent.ec2Status || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-500">Assigned to: </span>
                      <span className="text-gray-300">
                        {assignedUser ? assignedUser.name : 'Unassigned'}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-gray-500">Created: </span>
                      <span className="text-gray-300">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-400">Assign to:</label>
                    <select
                      value={assignedUser?.id || ''}
                      onChange={(e) => handleAssignAgent(agent.id, e.target.value || null)}
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {users.filter(u => {
                        const currentAgents = u.assignedAgents?.length || 0
                        return currentAgents < u.subscription.maxAgents || u.id === assignedUser?.id
                      }).map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.assignedAgents?.length || 0}/{user.subscription.maxAgents} agents)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors ml-4">
                  Configure
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Security & System Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="dashboard-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Secure</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">System Security</h3>
          <p className="text-gray-400 text-sm">All systems operational with enhanced security protocols active</p>
        </div>

        <div className="dashboard-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Active</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">API Status</h3>
          <p className="text-gray-400 text-sm">All external APIs responding normally</p>
        </div>

        <div className="dashboard-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Lock className="w-8 h-8 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Protected</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Data Encryption</h3>
          <p className="text-gray-400 text-sm">End-to-end encryption enabled for all communications</p>
        </div>
      </div>

      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm text-white">System Security Scan Completed</p>
                <p className="text-xs text-gray-500">All systems passed security checks</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div>
                <p className="text-sm text-white">SSL Certificates Renewed</p>
                <p className="text-xs text-gray-500">All certificates valid for 365 days</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )

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
              <label className="block text-sm font-medium text-gray-300 mb-2">Assign to User</label>
              <select
                value={agentForm.assignedUserId}
                onChange={(e) => setAgentForm({ ...agentForm, assignedUserId: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a user (optional)</option>
                {users.filter(u => (u.assignedAgents?.length || 0) < u.subscription.maxAgents).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email} ({user.assignedAgents?.length || 0}/{user.subscription.maxAgents} agents)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* System Prompt */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
            System Configuration
          </h3>
          
          <div className="space-y-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Initial Message</label>
              <textarea
                value={agentForm.customerConfig.leadingMessage}
                onChange={(e) => setAgentForm({
                  ...agentForm,
                  customerConfig: { ...agentForm.customerConfig, leadingMessage: e.target.value }
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Hello! How can I help you today?"
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
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Settings className="w-4 h-4 mr-2" />
              Console
            </button>
            
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
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 font-medium ${activeTab === 'security' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
        >
          <Shield className="w-4 h-4 inline mr-2" />
          Security
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'agents' && renderAgentsTab()}
        {activeTab === 'create-agent' && renderCreateAgentForm()}
        {activeTab === 'security' && renderSecurityTab()}
      </div>

      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                <input
                  type="text"
                  value={userForm.company}
                  onChange={(e) => setUserForm({ ...userForm, company: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Plan</label>
                <select
                  value={userForm.tierId}
                  onChange={(e) => setUserForm({ ...userForm, tierId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic (1 agent)</option>
                  <option value="starter">Starter (2 agents)</option>
                  <option value="professional">Professional (3 agents)</option>
                  <option value="enterprise">Enterprise (5 agents)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 