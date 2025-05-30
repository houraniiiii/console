import { BarChart3 } from 'lucide-react'
import { Campaign } from '@/types'

interface AnalyticsTabProps {
  campaigns: Campaign[]
}

export default function AnalyticsTab({ campaigns }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
      </div>
      
      <div className="dashboard-card rounded-xl p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
          <p className="text-gray-400">Detailed analytics and reporting coming soon</p>
        </div>
      </div>
    </div>
  )
} 