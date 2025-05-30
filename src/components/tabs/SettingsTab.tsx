import { Settings } from 'lucide-react'

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
      </div>
      
      <div className="dashboard-card rounded-xl p-6">
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Settings Panel</h3>
          <p className="text-gray-400">Configuration options coming soon</p>
        </div>
      </div>
    </div>
  )
} 