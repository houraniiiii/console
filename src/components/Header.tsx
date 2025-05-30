import { Activity, LogOut, Settings, User as UserIcon, Crown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/types'
import Link from 'next/link'

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-gray-850/50 backdrop-blur-sm border-b border-white/10 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">
            Vertirix Console
          </h1>
        </div>

        <div className="flex items-center space-x-6">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 