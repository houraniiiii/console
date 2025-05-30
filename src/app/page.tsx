'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useConsoleData } from '@/hooks/useConsoleData'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import OverviewTab from '@/components/tabs/OverviewTab'
import AgentsTab from '@/components/tabs/AgentsTab'
import ContactsTab from '@/components/tabs/ContactsTab'
import CampaignsTab from '@/components/tabs/CampaignsTab'
import AnalyticsTab from '@/components/tabs/AnalyticsTab'
import InstanceTab from '@/components/tabs/InstanceTab'
import SettingsTab from '@/components/tabs/SettingsTab'

export type TabType = 'overview' | 'agents' | 'contacts' | 'campaigns' | 'analytics' | 'instance' | 'settings'

export default function ConsolePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const consoleData = useConsoleData()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Redirect admins to admin panel
  useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin')
    }
  }, [user, router])

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading console...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={consoleData.stats}
            subscription={user.subscription}
            createCampaign={consoleData.createCampaign}
            addContacts={consoleData.addContacts}
          />
        )
      case 'agents':
        return (
          <AgentsTab
            agents={consoleData.agents}
            subscription={user.subscription}
            updateAgent={consoleData.updateAgent}
            updateSubscription={consoleData.updateSubscription}
          />
        )
      case 'contacts':
        return (
          <ContactsTab
            contacts={consoleData.contacts}
            addContacts={consoleData.addContacts}
          />
        )
      case 'campaigns':
        return (
          <CampaignsTab
            campaigns={consoleData.campaigns}
            agents={consoleData.agents}
            createCampaign={consoleData.createCampaign}
            updateCampaign={consoleData.updateCampaign}
            deleteCampaign={consoleData.deleteCampaign}
          />
        )
      case 'analytics':
        return <AnalyticsTab campaigns={consoleData.campaigns} />
      case 'instance':
        return (
          <InstanceTab
            instanceStatus={consoleData.instanceStatus}
            toggleInstance={consoleData.toggleInstance}
          />
        )
      case 'settings':
        return <SettingsTab />
      default:
        return (
          <OverviewTab
            stats={consoleData.stats}
            subscription={user.subscription}
            createCampaign={consoleData.createCampaign}
            addContacts={consoleData.addContacts}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        instanceRunning={consoleData.instanceStatus.isRunning}
        user={user}
      />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6">
          <div className="animate-fade-in">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  )
} 