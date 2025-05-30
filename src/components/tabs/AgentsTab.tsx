import { Settings, Crown, Volume2, Globe, MessageSquare, Clock, Edit, Calendar } from 'lucide-react'
import { Agent, UserSubscription } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AgentsTabProps {
  agents: Agent[]
  subscription: UserSubscription
  updateAgent: (id: string, updates: Partial<Agent>) => void
}

export default function AgentsTab({ agents, subscription, updateAgent }: AgentsTabProps) {
  const handleToggleStatus = (agent: Agent) => {
    const newStatus = agent.status === 'active' ? 'inactive' : 'active'
    
    // Check if activating would exceed subscription limit
    if (newStatus === 'active') {
      const activeCount = agents.filter(a => a.status === 'active').length
      if (activeCount >= subscription.maxAgents) {
        toast.error(`Your ${subscription.tierName} plan allows only ${subscription.maxAgents} active agent${subscription.maxAgents > 1 ? 's' : ''}`)
        return
      }
    }
    
    updateAgent(agent.id, { status: newStatus })
    toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
  }

  const formatLastUsed = (lastUsed?: Date) => {
    if (!lastUsed) return 'Never used'
    const now = new Date()
    const diff = now.getTime() - new Date(lastUsed).getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const getVoiceTypeDisplay = (ttsProvider: string) => {
    // Since customers don't see technical details, we'll show a simplified version
    return 'Voice Enabled'
  }

  const getVoiceTypeColor = (ttsProvider: string) => {
    return 'bg-blue-500/20 text-blue-400'
  }

  const getLanguageDisplay = (callHours: any) => {
    // Simplified language display
    return 'Multi-language'
  }

  const getResponseTimeLabel = (responseDelay: number) => {
    if (responseDelay < 1500) return 'Very Fast'
    if (responseDelay < 2500) return 'Normal'
    return 'Thoughtful'
  }

  const getScheduleStatus = (agent: Agent) => {
    if (!agent.schedule?.enabled) return null
    
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const currentDay = now.getDay()
    
    const isInScheduledDays = agent.schedule.daysOfWeek.includes(currentDay)
    const isInTimeRange = currentTime >= agent.schedule.startTime && currentTime <= agent.schedule.endTime
    
    if (isInScheduledDays && isInTimeRange) {
      return { status: 'active', text: 'In Schedule' }
    } else if (isInScheduledDays) {
      return { status: 'waiting', text: 'Scheduled Today' }
    } else {
      return { status: 'inactive', text: 'Off Schedule' }
    }
  }

  const formatSchedule = (schedule: Agent['schedule']) => {
    if (!schedule?.enabled) return 'Manual only'
    
    const days = schedule.daysOfWeek.map(d => {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      return dayNames[d]
    }).join(', ')
    
    return `${schedule.startTime}-${schedule.endTime} (${days})`
  }

  const activeAgents = agents.filter(a => a.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Voice Agents</h2>
          <p className="text-gray-400 mt-1">Configure and manage your AI voice agents</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="glass-card px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">
                {subscription.tierName} Plan - {activeAgents}/{subscription.maxAgents} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="dashboard-card rounded-xl p-6 hover:border-gray-600 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className={`w-4 h-4 rounded-full mt-1 ${
                  agent.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      agent.status === 'active' 
                        ? 'bg-green-400/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">{agent.description}</p>

                  {/* Voice Configuration Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Voice Type */}
                    <div className="flex items-center space-x-2">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Voice</p>
                        <span className="text-xs px-2 py-1 rounded font-medium bg-blue-500/20 text-blue-400">
                          Professional Voice
                        </span>
                      </div>
                    </div>

                    {/* Speed */}
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Speed</p>
                        <p className="text-sm text-gray-300">{agent.customerConfig.voiceSpeed}x</p>
                      </div>
                    </div>

                    {/* Response Time */}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Response</p>
                        <p className="text-sm text-gray-300">
                          {getResponseTimeLabel(agent.customerConfig.responseDelay)} ({agent.customerConfig.responseDelay}ms)
                        </p>
                      </div>
                    </div>

                    {/* Schedule Status */}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Schedule</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-300">{formatSchedule(agent.schedule)}</p>
                          {agent.schedule?.enabled && (
                            <span className={`w-2 h-2 rounded-full ${
                              getScheduleStatus(agent)?.status === 'active' ? 'bg-green-400' :
                              getScheduleStatus(agent)?.status === 'waiting' ? 'bg-yellow-400' : 'bg-gray-500'
                            }`} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Status Information */}
                  <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Personality</p>
                        <p className="text-sm text-gray-300">{agent.customerConfig.personality}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Leading Message
                        </p>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          "{agent.customerConfig.leadingMessage.substring(0, 80)}
                          {agent.customerConfig.leadingMessage.length > 80 ? '...' : ''}"
                        </p>
                      </div>
                      {agent.schedule?.enabled && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Next Activation
                          </p>
                          <p className="text-sm text-gray-300">
                            {getScheduleStatus(agent)?.text || 'No schedule'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  href={`/agents/${agent.id}/edit`}
                  className="btn-secondary text-sm px-4 py-2 flex items-center no-underline hover:bg-gray-700/50 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Agent
                </Link>
                <button 
                  onClick={() => handleToggleStatus(agent)}
                  className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                    agent.status === 'active' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
                  }`}
                >
                  {agent.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {agents.length < subscription.maxAgents && (
        <div className="dashboard-card rounded-xl p-6">
          <div className="text-center py-8">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Unlock More Agents
            </h3>
            <p className="text-gray-400 mb-4">
              Contact your administrator to upgrade your subscription plan and access more voice agents
            </p>
            <div className="flex justify-center">
              <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg">
                <p className="text-sm text-gray-400">
                  Using {activeAgents} of {subscription.maxAgents} available agents
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {agents.length === 0 && (
        <div className="dashboard-card rounded-xl p-6">
          <div className="text-center py-12">
            <Volume2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Voice Agents Available
            </h3>
            <p className="text-gray-400 mb-4">
              No voice agents are configured for your account. Contact your administrator for access.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 