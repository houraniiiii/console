'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Crown, 
  Calendar,
  Building,
  Mail,
  Shield,
  MoreVertical
} from 'lucide-react'
import { User, CreateUserRequest } from '@/types'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const { user, isAuthenticated, isLoading, getAllUsers, createUser, updateUser, deleteUser } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/login')
      return
    }
    
    if (user?.role === 'admin') {
      refreshUsers()
    }
  }, [isAuthenticated, user, isLoading, router])

  const refreshUsers = () => {
    const allUsers = getAllUsers()
    setUsers(allUsers)
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (u.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && u.isActive) ||
                         (statusFilter === 'inactive' && !u.isActive)
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleCreateUser = async (userData: CreateUserRequest) => {
    const success = await createUser(userData)
    if (success) {
      refreshUsers()
      setShowCreateModal(false)
    }
  }

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    const success = await updateUser(userId, updates)
    if (success) {
      refreshUsers()
      setEditingUser(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const success = await deleteUser(userId)
      if (success) {
        refreshUsers()
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage users and subscription plans</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary px-6 py-3 rounded-lg text-white font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="dashboard-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="dashboard-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.isActive).length}</p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="dashboard-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Enterprise Users</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.subscription.tierId === 'enterprise').length}
                </p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="dashboard-card rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => {
                    const created = new Date(u.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-card rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="dashboard-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-300">User</th>
                  <th className="text-left p-4 font-medium text-gray-300">Role</th>
                  <th className="text-left p-4 font-medium text-gray-300">Plan</th>
                  <th className="text-left p-4 font-medium text-gray-300">Status</th>
                  <th className="text-left p-4 font-medium text-gray-300">Created</th>
                  <th className="text-left p-4 font-medium text-gray-300">Last Login</th>
                  <th className="text-left p-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <Mail className="w-3 h-3" />
                            <span>{u.email}</span>
                          </div>
                          {u.company && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Building className="w-3 h-3" />
                              <span>{u.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">{u.subscription.tierName}</span>
                        <span className="text-xs text-gray-400">
                          ({u.subscription.usedAgents}/{u.subscription.maxAgents})
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${
                        u.isActive 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUpdateUser}
        />
      )}
    </div>
  )
}

// Create User Modal Component
function CreateUserModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void
  onCreate: (data: CreateUserRequest) => Promise<void>
}) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    name: '',
    password: '',
    company: '',
    subscription: {
      tierId: 'basic',
      tierName: 'Basic',
      maxAgents: 1
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tierOptions = [
    { id: 'basic', name: 'Basic', maxAgents: 1 },
    { id: 'starter', name: 'Starter', maxAgents: 2 },
    { id: 'professional', name: 'Professional', maxAgents: 3 },
    { id: 'enterprise', name: 'Enterprise', maxAgents: 5 }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onCreate(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Create New User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company (Optional)</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Plan</label>
            <select
              value={formData.subscription.tierId}
              onChange={(e) => {
                const tier = tierOptions.find(t => t.id === e.target.value)!
                setFormData({
                  ...formData,
                  subscription: {
                    tierId: tier.id,
                    tierName: tier.name,
                    maxAgents: tier.maxAgents
                  }
                })
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {tierOptions.map(tier => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} ({tier.maxAgents} agent{tier.maxAgents > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User
  onClose: () => void
  onUpdate: (userId: string, updates: Partial<User>) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    company: user.company || '',
    isActive: user.isActive,
    subscription: user.subscription
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const tierOptions = [
    { id: 'basic', name: 'Basic', maxAgents: 1 },
    { id: 'starter', name: 'Starter', maxAgents: 2 },
    { id: 'professional', name: 'Professional', maxAgents: 3 },
    { id: 'enterprise', name: 'Enterprise', maxAgents: 5 }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onUpdate(user.id, formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h2 className="text-xl font-semibold text-white mb-6">Edit User</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Plan</label>
            <select
              value={formData.subscription.tierId}
              onChange={(e) => {
                const tier = tierOptions.find(t => t.id === e.target.value)!
                setFormData({
                  ...formData,
                  subscription: {
                    ...formData.subscription,
                    tierId: tier.id,
                    tierName: tier.name,
                    maxAgents: tier.maxAgents
                  }
                })
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {tierOptions.map(tier => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} ({tier.maxAgents} agent{tier.maxAgents > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-gray-700 text-primary focus:ring-primary"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
              Account is active
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 