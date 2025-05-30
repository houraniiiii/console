'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Bot, Check, Volume2, Globe, MessageSquare, Clock, Calendar } from 'lucide-react'
import { Agent } from '@/types'
import { useConsoleData } from '@/hooks/useConsoleData'
import toast from 'react-hot-toast'

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string
  const { agents, updateAgent } = useConsoleData()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    voice: '' as Agent['configuration']['voice'],
    language: '' as Agent['configuration']['language'],
    personality: '',
    responseTime: 2000,
    firstMessage: ''
  })
  const [scheduleData, setScheduleData] = useState({
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'UTC',
    daysOfWeek: [] as number[],
    autoActivate: true
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const foundAgent = agents.find(a => a.id === agentId)
    if (foundAgent) {
      setAgent(foundAgent)
      setFormData(foundAgent.configuration)
      if (foundAgent.schedule) {
        setScheduleData(foundAgent.schedule)
      }
    } else {
      toast.error('Agent not found')
      router.push('/')
    }
  }, [agentId, agents, router])

  const handleSave = async () => {
    if (!agent) return

    // Validate form
    if (!formData.firstMessage.trim()) {
      toast.error('First message is required')
      return
    }
    
    if (!formData.personality.trim()) {
      toast.error('Personality description is required')
      return
    }

    setIsSaving(true)
    
    try {
      // Update agent configuration
      await updateAgent(agentId, { 
        configuration: formData,
        schedule: scheduleData,
        lastUsed: new Date()
      })
      
      toast.success('Agent updated successfully!')
      router.push('/')
    } catch (error) {
      toast.error('Failed to update agent')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDayToggle = (day: number) => {
    setScheduleData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) 
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort()
    }))
  }

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
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

  const getVoiceDescription = (voice: Agent['configuration']['voice']) => {
    switch (voice) {
      case 'hyper-realistic': return 'Most natural and human-like voice with advanced prosody'
      case 'realistic': return 'Natural-sounding voice with good intonation'
      case 'custom': return 'Customizable voice with specific characteristics'
      case 'professional': return 'Clear, business-appropriate voice'
      case 'standard': return 'Basic synthetic voice, resource-efficient'
      default: return ''
    }
  }

  const isFormValid = formData.firstMessage.trim() && formData.personality.trim()

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
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
              className="btn-secondary p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Voice Agent</h1>
              <p className="text-gray-400">{agent.name} • {agent.description}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Agent Status Card */}
        <div className="dashboard-card rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                agent.status === 'active' ? 'bg-green-400' : 'bg-gray-500'
              }`} />
              <div>
                <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                <p className="text-gray-400">{agent.description}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                agent.status === 'active' 
                  ? 'bg-green-400/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {agent.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-400" />
            Voice Agent Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Voice Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-1" />
                Voice Type
              </label>
              <select
                value={formData.voice}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  voice: e.target.value as Agent['configuration']['voice']
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="hyper-realistic">Hyper Realistic</option>
                <option value="realistic">Realistic</option>
                <option value="custom">Custom</option>
                <option value="professional">Professional</option>
                <option value="standard">Standard</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getVoiceDescription(formData.voice)}
              </p>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  language: e.target.value as Agent['configuration']['language']
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="en-US">English (US)</option>
                <option value="ar">Arabic</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Primary language for voice interactions
              </p>
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
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
                  responseTime: parseInt(e.target.value) || 2000
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.responseTime < 1500 ? 'Very fast response' :
                 formData.responseTime < 2500 ? 'Normal response time' : 'Thoughtful response'}
              </p>
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Personality & Tone
              </label>
              <input
                type="text"
                value={formData.personality}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  personality: e.target.value
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder="e.g. Professional and persuasive"
              />
              <p className="text-xs text-gray-500 mt-1">
                Defines the agent's communication style and approach
              </p>
            </div>
          </div>

          {/* First Message */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              Initial Message (Intro)
            </label>
            <textarea
              value={formData.firstMessage}
              onChange={(e) => setFormData({ 
                ...formData, 
                firstMessage: e.target.value
              })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              rows={4}
              placeholder="Enter the opening message the agent will use when starting conversations..."
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                This is the first thing callers will hear from this agent
              </p>
              <span className={`text-xs ${
                formData.firstMessage.length > 200 ? 'text-yellow-400' : 'text-gray-500'
              }`}>
                {formData.firstMessage.length}/300
              </span>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-white mb-2">Schedule Configuration</h4>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={scheduleData.enabled}
                onChange={(e) => setScheduleData({ 
                  ...scheduleData, 
                  enabled: e.target.checked
                })}
                className="w-4 h-4 text-primary"
              />
              <label className="text-sm font-medium text-gray-300">Enable Schedule</label>
            </div>
          </div>

          {/* Time Settings */}
          <div className="mt-4">
            <h5 className="text-md font-semibold text-white mb-2">Time Settings</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                <input
                  type="time"
                  value={scheduleData.startTime}
                  onChange={(e) => setScheduleData({ 
                    ...scheduleData, 
                    startTime: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                <input
                  type="time"
                  value={scheduleData.endTime}
                  onChange={(e) => setScheduleData({ 
                    ...scheduleData, 
                    endTime: e.target.value
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
            <select
              value={scheduleData.timezone}
              onChange={(e) => setScheduleData({ 
                ...scheduleData, 
                timezone: e.target.value
              })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>

          {/* Days of Week */}
          <div className="mt-4">
            <h5 className="text-md font-semibold text-white mb-2">Days of Week</h5>
            <div className="flex items-center space-x-4">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={scheduleData.daysOfWeek.includes(i)}
                    onChange={(e) => handleDayToggle(i)}
                    className="w-4 h-4 text-primary"
                  />
                  <label className="text-sm font-medium text-gray-300">{getDayName(i)}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-activation */}
          <div className="mt-4">
            <h5 className="text-md font-semibold text-white mb-2">Auto-activation</h5>
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={scheduleData.autoActivate}
                onChange={(e) => setScheduleData({ 
                  ...scheduleData, 
                  autoActivate: e.target.checked
                })}
                className="w-4 h-4 text-primary"
              />
              <label className="text-sm font-medium text-gray-300">Auto-activate</label>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-gray-700">
            <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center">
              <Check className="w-4 h-4 mr-2 text-green-400" />
              Configuration Preview
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Voice Type:</span>
                  <span className="text-white font-medium">{getVoiceTypeDisplay(formData.voice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Language:</span>
                  <span className="text-white">{formData.language === 'en-US' ? 'English (US)' : 'Arabic'}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="text-white">{formData.responseTime}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Personality:</span>
                  <span className="text-white truncate">{formData.personality || 'Not set'}</span>
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            {scheduleData.enabled && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                  Schedule Preview
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Hours:</span>
                      <span className="text-white">{scheduleData.startTime} - {scheduleData.endTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Timezone:</span>
                      <span className="text-white">{scheduleData.timezone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Days:</span>
                      <span className="text-white">
                        {scheduleData.daysOfWeek.length > 0 
                          ? scheduleData.daysOfWeek.map(d => getDayName(d).slice(0, 3)).join(', ')
                          : 'None selected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Auto-activate:</span>
                      <span className={scheduleData.autoActivate ? 'text-green-400' : 'text-gray-400'}>
                        {scheduleData.autoActivate ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <p className="text-blue-400 text-xs">
                    <strong>Note:</strong> Agent will automatically activate during scheduled hours and deactivate when outside the schedule.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-gray-500 mb-2">First Message Preview:</p>
              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                <p className="text-white text-sm leading-relaxed">
                  {formData.firstMessage || 'No message set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 