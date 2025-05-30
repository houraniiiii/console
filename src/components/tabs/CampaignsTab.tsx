'use client'

import { useState } from 'react'
import { 
  Megaphone, 
  Plus, 
  Play, 
  Pause, 
  Square, 
  Phone, 
  Users, 
  Clock, 
  TrendingUp,
  Edit,
  Trash2,
  Calendar,
  X
} from 'lucide-react'
import { Campaign, Agent, ContactList } from '@/types'
import toast from 'react-hot-toast'

interface CampaignsTabProps {
  campaigns: Campaign[]
  agents: Agent[]
  contactLists: ContactList[]
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
}

export default function CampaignsTab({ 
  campaigns, 
  agents, 
  contactLists, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign 
}: CampaignsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    agentId: '',
    contactListId: '',
    callSettings: {
      callsPerMinute: 10,
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'UTC',
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      maxAttempts: 3,
      retryDelay: 24 // hours
    }
  })

  const handleCreateCampaign = () => {
    if (!formData.name.trim() || !formData.agentId || !formData.contactListId) {
      toast.error('Please fill in all required fields')
      return
    }

    const selectedContactList = contactLists.find(list => list.id === formData.contactListId)
    if (!selectedContactList) {
      toast.error('Selected contact list not found')
      return
    }

    const campaignData: Omit<Campaign, 'id' | 'createdAt'> = {
      name: formData.name,
      agentId: formData.agentId,
      contactListId: formData.contactListId,
      userId: 'current-user', // This should come from auth context
      status: 'draft',
      callSettings: formData.callSettings,
      stats: {
        totalContacts: selectedContactList.totalContacts,
        contactsCalled: 0,
        successfulCalls: 0,
        failedCalls: 0,
        pendingCalls: selectedContactList.totalContacts,
        averageCallDuration: 0,
        successRate: 0
      }
    }

    createCampaign(campaignData)
    toast.success('Campaign created successfully!')
    setShowCreateModal(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      agentId: '',
      contactListId: '',
      callSettings: {
        callsPerMinute: 10,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        daysOfWeek: [1, 2, 3, 4, 5],
        maxAttempts: 3,
        retryDelay: 24
      }
    })
  }

  const handleStatusChange = (campaign: Campaign, newStatus: Campaign['status']) => {
    if (newStatus === 'active' && campaign.status !== 'active') {
      // Starting campaign
      if (campaign.stats.pendingCalls === 0) {
        toast.error('No pending contacts to call')
        return
      }
      
      updateCampaign(campaign.id, { 
        status: newStatus,
        startDate: new Date(),
        nextCallTime: new Date()
      })
      toast.success('Campaign started!')
    } else if (newStatus === 'paused') {
      updateCampaign(campaign.id, { status: newStatus })
      toast.success('Campaign paused')
    } else if (newStatus === 'completed') {
      updateCampaign(campaign.id, { 
        status: newStatus,
        endDate: new Date()
      })
      toast.success('Campaign completed')
    }
  }

  const handleDelete = (campaign: Campaign) => {
    if (confirm(`Are you sure you want to delete "${campaign.name}"?`)) {
      deleteCampaign(campaign.id)
      toast.success('Campaign deleted')
    }
  }

  const formatDaysOfWeek = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map(day => dayNames[day]).join(', ')
  }

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'scheduled': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getAgent = (agentId: string) => agents.find(a => a.id === agentId)
  const getContactList = (listId: string) => contactLists.find(cl => cl.id === listId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Campaign Management</h2>
          <p className="text-gray-400 mt-1">Create and manage your calling campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={agents.length === 0 || contactLists.length === 0}
          className="btn-primary px-4 py-2 flex items-center disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Prerequisites Check */}
      {(agents.length === 0 || contactLists.length === 0) && (
        <div className="dashboard-card rounded-xl p-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="text-yellow-400 font-medium mb-2">Setup Required</h3>
            <p className="text-yellow-300 text-sm mb-3">
              You need both active agents and contact lists to create campaigns.
            </p>
            <div className="space-y-1 text-sm">
              {agents.length === 0 && (
                <p className="text-yellow-300">• No agents available - contact your administrator</p>
              )}
              {contactLists.length === 0 && (
                <p className="text-yellow-300">• No contact lists - upload contacts first</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid gap-6">
        {campaigns.map((campaign) => {
          const agent = getAgent(campaign.agentId)
          const contactList = getContactList(campaign.contactListId)
          
          return (
            <div key={campaign.id} className="dashboard-card rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Agent</p>
                      <p className="text-gray-300">{agent?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Contact List</p>
                      <p className="text-gray-300">{contactList?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Schedule</p>
                      <p className="text-gray-300">
                        {campaign.callSettings.startTime} - {campaign.callSettings.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(campaign, 'active')}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Start Campaign"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  {campaign.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange(campaign, 'paused')}
                      className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      title="Pause Campaign"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  
                  {campaign.status === 'paused' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(campaign, 'active')}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Resume Campaign"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(campaign, 'completed')}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Complete Campaign"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleDelete(campaign)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Campaign Statistics */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{campaign.stats.totalContacts}</div>
                    <div className="text-xs text-gray-500">Total Contacts</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{campaign.stats.pendingCalls}</div>
                    <div className="text-xs text-gray-500">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">{campaign.stats.contactsCalled}</div>
                    <div className="text-xs text-gray-500">Called</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{campaign.stats.successfulCalls}</div>
                    <div className="text-xs text-gray-500">Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{campaign.stats.successRate}%</div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Campaign Settings Summary */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Calls/min:</span>
                    <span className="text-gray-300">{campaign.callSettings.callsPerMinute}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Days:</span>
                    <span className="text-gray-300">{formatDaysOfWeek(campaign.callSettings.daysOfWeek)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-500">Retry:</span>
                    <span className="text-gray-300">{campaign.callSettings.maxAttempts}x</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {campaigns.length === 0 && agents.length > 0 && contactLists.length > 0 && (
        <div className="dashboard-card rounded-xl p-6">
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Campaigns Yet</h3>
            <p className="text-gray-400 mb-4">
              Create your first campaign to start calling your contacts
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary px-6 py-3"
            >
              Create Your First Campaign
            </button>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Create New Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 Sales Outreach"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Agent *</label>
                  <select
                    value={formData.agentId}
                    onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose an agent...</option>
                    {agents.filter(a => a.status === 'active' || a.status === 'inactive').map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Contact List *</label>
                  <select
                    value={formData.contactListId}
                    onChange={(e) => setFormData({ ...formData, contactListId: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Choose a contact list...</option>
                    {contactLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.name} ({list.totalContacts} contacts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-medium text-white mb-4">Call Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Calls per Minute</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.callSettings.callsPerMinute}
                      onChange={(e) => setFormData({
                        ...formData,
                        callSettings: { ...formData.callSettings, callsPerMinute: parseInt(e.target.value) }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={formData.callSettings.startTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        callSettings: { ...formData.callSettings, startTime: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
                    <input
                      type="time"
                      value={formData.callSettings.endTime}
                      onChange={(e) => setFormData({
                        ...formData,
                        callSettings: { ...formData.callSettings, endTime: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Active Days</label>
                  <div className="flex space-x-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={index} className="flex items-center space-x-1">
                        <input
                          type="checkbox"
                          checked={formData.callSettings.daysOfWeek.includes(index)}
                          onChange={(e) => {
                            const days = formData.callSettings.daysOfWeek
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                callSettings: {
                                  ...formData.callSettings,
                                  daysOfWeek: [...days, index].sort()
                                }
                              })
                            } else {
                              setFormData({
                                ...formData,
                                callSettings: {
                                  ...formData.callSettings,
                                  daysOfWeek: days.filter(d => d !== index)
                                }
                              })
                            }
                          }}
                          className="text-blue-500"
                        />
                        <span className="text-sm text-gray-300">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={!formData.name.trim() || !formData.agentId || !formData.contactListId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 