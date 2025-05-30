'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AlertTriangle, Shield, Clock, User } from 'lucide-react'
import toast from 'react-hot-toast'

interface SecurityEvent {
  id: string
  type: 'login_failed' | 'account_locked' | 'session_expired' | 'password_changed'
  message: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

export default function SecurityMonitor() {
  const { isAuthenticated, user } = useAuth()
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return

    // Monitor localStorage for security events
    const checkSecurityEvents = () => {
      const loginAttempts = localStorage.getItem('vertirix-login-attempts')
      if (loginAttempts) {
        const attempts = JSON.parse(loginAttempts)
        const events: SecurityEvent[] = []
        
        Object.entries(attempts).forEach(([email, data]: [string, any]) => {
          if (data.count >= 3) {
            events.push({
              id: `failed-${email}-${data.lastAttempt}`,
              type: 'login_failed',
              message: `Multiple failed login attempts for ${email} (${data.count} attempts)`,
              timestamp: new Date(data.lastAttempt),
              severity: data.count >= 5 ? 'high' : 'medium'
            })
          }
        })
        
        setSecurityEvents(events.slice(-10)) // Keep last 10 events
      }
    }

    // Check immediately and then every 30 seconds
    checkSecurityEvents()
    const interval = setInterval(checkSecurityEvents, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user])

  if (!isAuthenticated || user?.role !== 'admin' || securityEvents.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 max-w-sm">
        <div className="flex items-center space-x-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-sm font-medium text-white">Security Alerts</h3>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {securityEvents.map((event) => (
            <div 
              key={event.id}
              className={`p-2 rounded border-l-2 ${
                event.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                event.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                'border-blue-500 bg-blue-500/10'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  {event.type === 'login_failed' && <User className="w-3 h-3 text-red-400" />}
                  {event.type === 'account_locked' && <Shield className="w-3 h-3 text-red-400" />}
                  {event.type === 'session_expired' && <Clock className="w-3 h-3 text-yellow-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-200 break-words">{event.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {event.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={() => setSecurityEvents([])}
          className="text-xs text-gray-400 hover:text-white transition-colors mt-2"
        >
          Clear Alerts
        </button>
      </div>
    </div>
  )
} 