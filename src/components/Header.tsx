import { Activity, LogOut, Settings, User as UserIcon, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import Link from 'next/link'

interface HeaderProps {
  instanceRunning: boolean
  user: User
}

export default function Header({ instanceRunning, user }: HeaderProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="glass-card border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-xl font-bold text-white">Vertirix Console</h1>
          </div>
          
          {/* Instance Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${instanceRunning ? 'bg-green-400' : 'bg-gray-500'}`} />
            <span className="text-sm text-gray-400">
              {instanceRunning ? 'Instance Running' : 'Instance Stopped'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* User Subscription Badge */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-800/50 rounded-lg border border-gray-700">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">{user.subscription.tierName}</span>
            <span className="text-xs text-gray-500">
              {user.subscription.usedAgents}/{user.subscription.maxAgents}
            </span>
          </div>

          {/* Admin Panel Link */}
          {user.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 