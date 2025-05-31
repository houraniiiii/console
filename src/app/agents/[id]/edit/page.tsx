'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Bot, Check, Volume2, Globe, MessageSquare, Clock, Calendar, AlertTriangle } from 'lucide-react'
import { Agent } from '@/types'
import toast from 'react-hot-toast'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Discard Changes
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Keep Editing
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditAgentPage() {
  const router = useRouter()
  const params = useParams()
  const agentId = params.id as string

  const [agent, setAgent] = useState<Agent | null>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [formData, setFormData] = useState({
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Load agent data
  useEffect(() => {
    const loadAgent = () => {
      // Load agents from localStorage (admin-managed)
      const adminAgents = localStorage.getItem('admin-agents')
      let allAgents: Agent[] = []
      
      if (adminAgents) {
        try {
          allAgents = JSON.parse(adminAgents)
        } catch (error) {
          console.error('Error parsing admin agents:', error)
          toast.error('Error loading agent data')
          return
        }
      }
      
      const foundAgent = allAgents.find(a => a.id === agentId)
      if (foundAgent) {
        setAgent(foundAgent)
        const initialFormData = { ...foundAgent.customerConfig }
        const initialScheduleData = foundAgent.schedule || {
          enabled: false,
          startTime: '09:00',
          endTime: '17:00',
          timezone: 'UTC',
          daysOfWeek: [],
          autoActivate: true
        }
        
        setFormData(initialFormData)
        setScheduleData(initialScheduleData)
        setOriginalData({
          customerConfig: initialFormData,
          schedule: initialScheduleData
        })
      } else {
        toast.error('Agent not found')
        router.push('/')
      }
    }

    if (agentId) {
      loadAgent()
    }
  }, [agentId, router])

  // Detect unsaved changes
  useEffect(() => {
    if (!originalData) return

    const currentData = {
      customerConfig: formData,
      schedule: scheduleData
    }

    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(originalData)
    setHasUnsavedChanges(hasChanges)
  }, [formData, scheduleData, originalData])

  const handleSave = async () => {
    if (!agent) return

    // Validate form
    if (!formData.leadingMessage.trim()) {
      toast.error('Leading message is required')
      return
    }
    
    if (!formData.personality.trim()) {
      toast.error('Personality description is required')
      return
    }

    setIsSaving(true)
    
    try {
      // Load current agents from localStorage
      const adminAgents = localStorage.getItem('admin-agents')
      let allAgents: Agent[] = []
      
      if (adminAgents) {
        allAgents = JSON.parse(adminAgents)
      }

      // Update the specific agent
      const updatedAgents = allAgents.map(a => {
        if (a.id === agentId) {
          return {
            ...a,
            customerConfig: formData,
            schedule: scheduleData,
            lastUsed: new Date()
          }
        }
        return a
      })

      // Save back to localStorage
      localStorage.setItem('admin-agents', JSON.stringify(updatedAgents))

      // Update original data to reflect saved state
      setOriginalData({
        customerConfig: { ...formData },
        schedule: { ...scheduleData }
      })
      
      // Update the agent state
      setAgent(prev => prev ? {
        ...prev,
        customerConfig: formData,
        schedule: scheduleData,
        lastUsed: new Date()
      } : null)

      toast.success('Agent updated successfully!')
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to update agent')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true)
    } else {
      router.push('/')
    }
  }

  const handleConfirmDiscard = () => {
    setShowConfirmDialog(false)
    router.push('/')
  }

  const handleCancelDiscard = () => {
    setShowConfirmDialog(false)
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

  const getVoiceTypeDisplay = (speed: number) => {
    if (speed <= 0.7) return 'Slow & Clear'
    if (speed <= 1.0) return 'Normal Speed'
    if (speed <= 1.2) return 'Fast & Efficient'
    return 'Very Fast'
  }

  const isFormValid = formData.leadingMessage.trim() && formData.personality.trim()

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
              onClick={handleBack}
              className="btn-secondary p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Voice Agent</h1>
              <p className="text-gray-400">{agent.name} • {agent.description}</p>
              {hasUnsavedChanges && (
                <p className="text-yellow-400 text-sm mt-1">
                  • You have unsaved changes
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!isFormValid || isSaving || !hasUnsavedChanges}
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
            {/* Voice Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Volume2 className="w-4 h-4 mr-1" />
                Voice Speed
              </label>
              <select
                value={formData.voiceSpeed}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  voiceSpeed: parseFloat(e.target.value)
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="0.5">0.5x - Very Slow</option>
                <option value="0.7">0.7x - Slow</option>
                <option value="1.0">1.0x - Normal</option>
                <option value="1.2">1.2x - Fast</option>
                <option value="1.5">1.5x - Very Fast</option>
                <option value="2.0">2.0x - Maximum</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Adjust the speaking speed of your voice agent
              </p>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Globe className="w-4 h-4 mr-1" />
                Custom Instructions
              </label>
              <textarea
                value={formData.customInstructions}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  customInstructions: e.target.value
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                rows={3}
                placeholder="Add any specific instructions for this agent..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Additional guidance for the agent's behavior
              </p>
            </div>

            {/* Response Delay */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Response Delay (ms)
              </label>
              <input
                type="number"
                min="500"
                max="5000"
                step="100"
                value={formData.responseDelay}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  responseDelay: parseInt(e.target.value) || 1000
                })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.responseDelay < 1500 ? 'Very fast response' :
                 formData.responseDelay < 2500 ? 'Normal response time' : 'Thoughtful response'}
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
              value={formData.leadingMessage}
              onChange={(e) => setFormData({ 
                ...formData, 
                leadingMessage: e.target.value
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
                formData.leadingMessage.length > 200 ? 'text-yellow-400' : 'text-gray-500'
              }`}>
                {formData.leadingMessage.length}/300
              </span>
            </div>
          </div>

          {/* Schedule Configuration */}
          <div className="mt-8 border-t border-gray-700 pt-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-400" />
              Schedule Configuration
            </h4>
            <div className="flex items-center space-x-4 mb-4">
              <input
                type="checkbox"
                id="enableSchedule"
                checked={scheduleData.enabled}
                onChange={(e) => setScheduleData({ 
                  ...scheduleData, 
                  enabled: e.target.checked
                })}
                className="w-4 h-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
              />
              <label htmlFor="enableSchedule" className="text-sm font-medium text-gray-300">
                Enable Automatic Scheduling
              </label>
            </div>

            {scheduleData.enabled && (
              <div className="space-y-6 ml-6 pl-4 border-l-2 border-blue-500/30">
                {/* Time Settings */}
                <div>
                  <h5 className="text-md font-semibold text-white mb-3">Active Hours</h5>
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
                <div>
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
                <div>
                  <h5 className="text-md font-semibold text-white mb-3">Active Days</h5>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 7 }, (_, i) => (
                      <label key={i} className="flex flex-col items-center space-y-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleData.daysOfWeek.includes(i)}
                          onChange={() => handleDayToggle(i)}
                          className="w-4 h-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
                        />
                        <span className="text-xs font-medium text-gray-300">
                          {getDayName(i).slice(0, 3)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto-activation */}
                <div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="autoActivate"
                      checked={scheduleData.autoActivate}
                      onChange={(e) => setScheduleData({ 
                        ...scheduleData, 
                        autoActivate: e.target.checked
                      })}
                      className="w-4 h-4 text-primary bg-gray-800 border-gray-600 rounded focus:ring-primary"
                    />
                    <label htmlFor="autoActivate" className="text-sm font-medium text-gray-300">
                      Auto-activate during scheduled hours
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-8">
                    Agent will automatically activate/deactivate based on schedule
                  </p>
                </div>
              </div>
            )}
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
                  <span className="text-white font-medium">{getVoiceTypeDisplay(formData.voiceSpeed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Response Time:</span>
                  <span className="text-white">{formData.responseDelay}ms</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Personality:</span>
                  <span className="text-white truncate">{formData.personality || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Custom Instructions:</span>
                  <span className="text-white">{formData.customInstructions ? 'Set' : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Schedule Preview */}
            {scheduleData.enabled && (
              <div className="mt-6 pt-4 border-t border-gray-700">
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
              </div>
            )}
            
            <div className="mt-6">
              <p className="text-gray-500 mb-2">Initial Message Preview:</p>
              <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-purple-500">
                <p className="text-white text-sm leading-relaxed">
                  {formData.leadingMessage || 'No message set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them and leave this page?"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
      />
    </div>
  )
} 