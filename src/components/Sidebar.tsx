import { 
  BarChart3, 
  Bot, 
  Users, 
  Megaphone, 
  TrendingUp, 
  Server, 
  Settings,
  Phone
} from 'lucide-react'
import { TabType } from '@/app/page'

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Phone },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-black/60 backdrop-blur-sm border-r border-white/10 h-screen">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`sidebar-item w-full text-left flex items-center px-4 py-3 text-gray-300 rounded-lg ${
                isActive ? 'active' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
} 