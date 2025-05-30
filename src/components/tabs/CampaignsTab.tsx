import { Megaphone } from 'lucide-react'
import { Campaign, Agent } from '@/types'

interface CampaignsTabProps {
  campaigns: Campaign[]
  agents: Agent[]
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => Campaign
  updateCampaign: (id: string, updates: Partial<Campaign>) => void
  deleteCampaign: (id: string) => void
}

export default function CampaignsTab({ campaigns }: CampaignsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campaigns</h2>
      </div>
      
      <div className="dashboard-card rounded-xl p-6">
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No campaigns yet</h3>
          <p className="text-gray-400">Campaign management coming soon</p>
        </div>
      </div>
    </div>
  )
} 