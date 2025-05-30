'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Settings, 
  LogOut, 
  User, 
  Crown, 
  Shield, 
  Clock, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsTab() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 rounded-lg">
          {user?.role === 'admin' ? (
            <Crown className="w-4 h-4 text-yellow-400" />
          ) : (
            <User className="w-4 h-4 text-blue-400" />
          )}
          <span className="text-sm text-gray-300 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Account Information */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-blue-400" />
          Account Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <p className="text-white font-medium">{user?.name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <p className="text-white">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
              <p className="text-white">{user?.company || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Account Status</label>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-medium">Active</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Member Since</label>
              <p className="text-white">{user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Last Login</label>
              <p className="text-white">{user?.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Information */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Crown className="w-5 h-5 mr-2 text-yellow-400" />
          Subscription Plan
        </h3>
        
        <div className="bg-gray-900/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-white">{user?.subscription.tierName} Plan</h4>
              <p className="text-gray-400 text-sm">Professional voice agent management</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-400">{user?.subscription.usedAgents}</span>
              <span className="text-gray-500">/{user?.subscription.maxAgents}</span>
              <p className="text-gray-500 text-sm">Agents Used</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${user?.subscription ? (user.subscription.usedAgents / user.subscription.maxAgents) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-green-400" />
          Security & Privacy
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Session Management</p>
                <p className="text-gray-400 text-sm">Automatic logout after 24 hours of inactivity</p>
              </div>
            </div>
            <span className="text-green-400 text-sm">Enabled</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">Account Protection</p>
                <p className="text-gray-400 text-sm">Advanced security features active</p>
              </div>
            </div>
            <span className="text-green-400 text-sm">Active</span>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-gray-400" />
          Account Actions
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
          
          <p className="text-gray-500 text-sm text-center">
            You'll be redirected to the login page
          </p>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Confirm Logout</h3>
            </div>
            
            <p className="text-gray-400 mb-6">
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 