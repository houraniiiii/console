import { Settings, Crown } from 'lucide-react'
import { Agent, UserSubscription } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface AgentsTabProps {
  agents: Agent[]
  subscription: UserSubscription
  updateAgent: (id: string, updates: Partial<Agent>) => void
  updateSubscription: (tierId: 'basic' | 'starter' | 'professional' | 'enterprise') => void
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

  const getVoiceTypeDisplay = (voice: Agent['configuration']['voice']) => {
    switch (voice) {
      case 'hyper-realistic': return 'Hyper Realistic'
      case 'realistic': return 'Realistic'
      case 'custom': return 'Custom'
      case 'professional': return 'Professional'
      case 'standard': return 'Standard'
      default: return voice
    }
  }

  const getLanguageDisplay = (language: Agent['configuration']['language']) => {
    return language === 'en-US' ? 'English (US)' : 'Arabic'
  }

  const activeAgents = agents.filter(a => a.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Voice Agents</h2>
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
          <div key={agent.id} className="dashboard-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  agent.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
                }`} />
                <div>
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <p className="text-gray-400 text-sm">{agent.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs text-gray-500">
                      Voice: {getVoiceTypeDisplay(agent.configuration.voice)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Language: {getLanguageDisplay(agent.configuration.language)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Last used: {formatLastUsed(agent.lastUsed)}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      First Message: {agent.configuration.firstMessage.substring(0, 50)}...
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/agents/${agent.id}/edit`}
                  className="btn-secondary text-sm px-4 py-2 flex items-center no-underline"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Edit Agent
                </Link>
                <button 
                  onClick={() => handleToggleStatus(agent)}
                  className={`text-sm px-4 py-2 rounded-lg ${
                    agent.status === 'active' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
                  } transition-colors`}
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
              Contact your administrator to upgrade your subscription plan
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
    </div>
  )
} 