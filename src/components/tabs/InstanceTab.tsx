import { Pause, Play } from 'lucide-react'
import { InstanceStatus } from '@/types'
import toast from 'react-hot-toast'

interface InstanceTabProps {
  instanceStatus: InstanceStatus
  toggleInstance: () => void
}

export default function InstanceTab({ instanceStatus, toggleInstance }: InstanceTabProps) {
  const handleToggleInstance = () => {
    toggleInstance()
    toast.success(instanceStatus.isRunning ? 'Instance stopped successfully' : 'Instance started successfully')
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">EC2 Instance Management</h2>
      
      <div className="dashboard-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Instance Status</h3>
            <p className="text-gray-400">Manage your dedicated EC2 instance</p>
          </div>
          <button 
            onClick={handleToggleInstance}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              instanceStatus.isRunning 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
            }`}
          >
            {instanceStatus.isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Instance
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Instance
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-3 h-3 rounded-full ${
                instanceStatus.isRunning ? 'bg-green-400' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-white">
                {instanceStatus.isRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {instanceStatus.isRunning 
                ? `Uptime: ${instanceStatus.uptime}` 
                : instanceStatus.lastStopped 
                  ? `Last stopped: ${new Date(instanceStatus.lastStopped).toLocaleString()}`
                  : 'Ready to start'
              }
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm font-medium text-white mb-1">Today's Cost</p>
            <p className="text-lg font-bold text-green-400">${instanceStatus.todayCost.toFixed(2)}</p>
            <p className="text-xs text-gray-400">vs. 24/7: $178.50</p>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm font-medium text-white mb-1">Monthly Projection</p>
            <p className="text-lg font-bold text-white">${instanceStatus.monthlyProjection.toFixed(2)}</p>
            <p className="text-xs text-gray-400">Auto-schedule enabled</p>
          </div>
        </div>
      </div>
    </div>
  )
} 