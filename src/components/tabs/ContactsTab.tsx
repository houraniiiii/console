import { Upload, Users, Phone, Mail } from 'lucide-react'
import { Contact } from '@/types'
import toast from 'react-hot-toast'

interface ContactsTabProps {
  contacts: Contact[]
  addContacts: (contactList: Omit<Contact, 'id' | 'createdAt'>[]) => Contact[]
}

export default function ContactsTab({ contacts, addContacts }: ContactsTabProps) {
  const handleUploadContacts = () => {
    // Simulate adding demo contacts
    const demoContacts = [
      {
        name: 'John Smith',
        phone: '+1-555-0123',
        email: 'john@example.com',
        company: 'Tech Corp',
        status: 'pending' as const
      },
      {
        name: 'Sarah Johnson',
        phone: '+1-555-0124',
        email: 'sarah@example.com',
        company: 'Marketing Inc',
        status: 'pending' as const
      },
      {
        name: 'Mike Davis',
        phone: '+1-555-0125',
        email: 'mike@example.com',
        company: 'Sales Ltd',
        status: 'pending' as const
      }
    ]
    
    addContacts(demoContacts)
    toast.success(`${demoContacts.length} contacts uploaded successfully!`)
  }

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'called': return 'bg-blue-500/20 text-blue-400'
      case 'success': return 'bg-green-500/20 text-green-400'
      case 'failed': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Contact Management</h2>
        <button 
          onClick={handleUploadContacts}
          className="btn-primary text-white font-medium px-6 py-3 rounded-lg flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Contacts
        </button>
      </div>
      
      {contacts.length === 0 ? (
        <div className="dashboard-card rounded-xl p-6">
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No contacts uploaded yet</h3>
            <p className="text-gray-400 mb-6">Upload your contact lists to start running campaigns</p>
            <button 
              onClick={handleUploadContacts}
              className="btn-primary text-white font-medium px-6 py-3 rounded-lg"
            >
              Upload Your First Contact List
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="dashboard-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Contact List ({contacts.length})</h3>
              <button 
                onClick={handleUploadContacts}
                className="btn-secondary text-sm px-4 py-2 flex items-center"
              >
                <Upload className="w-3 h-3 mr-1" />
                Add More
              </button>
            </div>
            
            <div className="space-y-2">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-white">{contact.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 text-gray-400" />
                      <span className="text-sm text-gray-300">{contact.phone}</span>
                    </div>
                    {contact.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-300">{contact.email}</span>
                      </div>
                    )}
                    {contact.company && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {contact.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(contact.status)}`}>
                      {contact.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 