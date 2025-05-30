import { Phone, TrendingUp, Clock, Activity, Megaphone, Users } from 'lucide-react'
import { ConsoleStats, Campaign, Contact, UserSubscription } from '@/types'

interface OverviewTabProps {
  stats: ConsoleStats
  subscription: UserSubscription
  createCampaign: (campaignData: Omit<Campaign, 'id' | 'createdAt'>) => Campaign
  addContacts: (contactList: Omit<Contact, 'id' | 'createdAt'>[]) => Contact[]
}

export default function OverviewTab({ stats, subscription }: OverviewTabProps) {
  const statsData = [
    {
      title: 'Total Calls',
      value: stats.totalCalls.toString(),
      icon: Phone,
      color: 'text-purple-500'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      title: 'Avg Duration',
      value: stats.avgDuration,
      icon: Clock,
      color: 'text-pink-400'
    },
    {
      title: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      icon: Activity,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="dashboard-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Subscription Overview */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Subscription Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Current Plan</p>
            <p className="text-lg font-semibold text-white">{subscription.tierName}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Agents Used</p>
            <p className="text-lg font-semibold text-white">
              {subscription.usedAgents} / {subscription.maxAgents}
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-400">Active Agents</p>
            <p className="text-lg font-semibold text-green-400">{stats.activeAgents}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex space-x-4">
          <button className="btn-secondary font-medium px-6 py-3 rounded-lg flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Upload Contacts
          </button>
          <button className="btn-secondary font-medium px-6 py-3 rounded-lg flex items-center">
            <Megaphone className="w-4 h-4 mr-2" />
            Start Campaign
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        {stats.activeAgents === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">No activity yet. Activate your agents to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-white">Console initialized and ready</p>
                <p className="text-xs text-gray-400">Just now</p>
              </div>
              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-1 rounded">
                Ready
              </span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-800/50 rounded-lg">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <div className="flex-1">
                <p className="text-sm text-white">{stats.activeAgents} agent{stats.activeAgents > 1 ? 's' : ''} activated</p>
                <p className="text-xs text-gray-400">Active and ready for calls</p>
              </div>
              <span className="text-xs bg-blue-400/20 text-blue-400 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 