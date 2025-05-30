'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Bot } from 'lucide-react'
import { Agent } from '@/types'
import toast from 'react-hot-toast'

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    voice: '' as Agent['configuration']['voice'],
    language: '' as Agent['configuration']['language'],
    personality: '',
    responseTime: 2000,
    firstMessage: ''
  })

  useEffect(() => {
    // Load agent data from localStorage
    const savedAgents = localStorage.getItem('vertirix-agents')
    if (savedAgents) {
      const agents = JSON.parse(savedAgents)
      const foundAgent = agents.find((a: Agent) => a.id === agentId)
      if (foundAgent) {
        setAgent(foundAgent)
        setFormData(foundAgent.configuration)
      } else {
        toast.error('Agent not found')
        router.push('/')
      }
    }
  }, [agentId, router])

  const handleSave = () => {
    if (!agent) return

    // Update agent in localStorage
    const savedAgents = localStorage.getItem('vertirix-agents')
    if (savedAgents) {
      const agents = JSON.parse(savedAgents)
      const updatedAgents = agents.map((a: Agent) => 
        a.id === agentId 
          ? { ...a, configuration: formData }
          : a
      )
      localStorage.setItem('vertirix-agents', JSON.stringify(updatedAgents))
      toast.success('Agent updated successfully!')
      router.push('/')
    }
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

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading agent...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="btn-secondary p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Edit Agent</h1>
              <p className="text-gray-400">{agent.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            className="btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>

        {/* Agent Info Card */}
        <div className="dashboard-card rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-4 h-4 rounded-full ${
              agent.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
            }`} />
            <div>
              <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
              <p className="text-gray-400">{agent.description}</p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Agent Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Voice Type
              </label>
              <select
                value={formData.voice}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  voice: e.target.value as Agent['configuration']['voice']
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="hyper-realistic">Hyper Realistic</option>
                <option value="realistic">Realistic</option>
                <option value="custom">Custom</option>
                <option value="professional">Professional</option>
                <option value="standard">Standard</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current: {getVoiceTypeDisplay(formData.voice)}
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  language: e.target.value as Agent['configuration']['language']
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="en-US">English (US)</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Response Time (ms)
              </label>
              <input
                type="number"
                min="1000"
                max="5000"
                step="100"
                value={formData.responseTime}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  responseTime: parseInt(e.target.value)
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">
                How fast the agent responds to questions
              </p>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Personality
              </label>
              <input
                type="text"
                value={formData.personality}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  personality: e.target.value
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Professional and persuasive"
              />
            </div>
          </div>

          {/* First Message */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Message
            </label>
            <textarea
              value={formData.firstMessage}
              onChange={(e) => setFormData({ 
                ...formData, 
                firstMessage: e.target.value
              })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
              placeholder="Enter the opening message the agent will use..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be the first thing callers hear from this agent
            </p>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p><span className="text-gray-500">Voice:</span> {getVoiceTypeDisplay(formData.voice)}</p>
              <p><span className="text-gray-500">Language:</span> {formData.language === 'en-US' ? 'English (US)' : 'Arabic'}</p>
              <p><span className="text-gray-500">Personality:</span> {formData.personality}</p>
              <p><span className="text-gray-500">Response Time:</span> {formData.responseTime}ms</p>
              <div className="mt-3">
                <p className="text-gray-500 mb-1">First Message:</p>
                <div className="p-3 bg-gray-800 rounded text-white text-sm">
                  "{formData.firstMessage}"
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 