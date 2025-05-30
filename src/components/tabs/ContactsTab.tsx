'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Users, Search, Filter, FileText, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Contact, ContactList, CSVUploadResult } from '@/types'
import toast from 'react-hot-toast'

interface ContactsTabProps {
  contactLists: ContactList[]
  addContactList: (list: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateContactList: (id: string, updates: Partial<ContactList>) => void
  deleteContactList: (id: string) => void
}

const CSV_TEMPLATE = `name,phone,email,company,customField1,customField2
John Doe,+1-555-123-4567,john@example.com,Acme Corp,Sales,Hot Lead
Jane Smith,+1-555-987-6543,jane@company.com,Tech Inc,Marketing,Warm Lead
Bob Johnson,+1-555-456-7890,bob@startup.com,StartupXYZ,Support,Cold Lead`

export default function ContactsTab({ 
  contactLists, 
  addContactList, 
  updateContactList, 
  deleteContactList 
}: ContactsTabProps) {
  const [activeList, setActiveList] = useState<ContactList | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'called' | 'success' | 'failed'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null)
  const [newListName, setNewListName] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV parsing and validation
  const parseCSV = (csvText: string): CSVUploadResult => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      return { total: 0, valid: 0, invalid: 0, errors: ['CSV must have at least a header and one data row'], preview: [] }
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredFields = ['name', 'phone']
    const missingRequired = requiredFields.filter(field => !headers.includes(field))
    
    if (missingRequired.length > 0) {
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        errors: [`Missing required columns: ${missingRequired.join(', ')}`],
        preview: []
      }
    }

    const contacts: Contact[] = []
    const errors: string[] = []
    let validCount = 0
    let invalidCount = 0

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim())
      
      if (row.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`)
        invalidCount++
        continue
      }

      const rowData: any = {}
      headers.forEach((header, index) => {
        rowData[header] = row[index]
      })

      // Validate required fields
      if (!rowData.name || !rowData.phone) {
        errors.push(`Row ${i + 1}: Missing name or phone`)
        invalidCount++
        continue
      }

      // Validate phone format (basic)
      const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/
      const cleanPhone = rowData.phone.replace(/[\s\-\(\)]/g, '')
      if (!phoneRegex.test(cleanPhone)) {
        errors.push(`Row ${i + 1}: Invalid phone format`)
        invalidCount++
        continue
      }

      // Validate email if provided
      if (rowData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(rowData.email)) {
          errors.push(`Row ${i + 1}: Invalid email format`)
          invalidCount++
          continue
        }
      }

      // Create contact object
      const customFields: { [key: string]: string } = {}
      headers.forEach(header => {
        if (!['name', 'phone', 'email', 'company'].includes(header)) {
          customFields[header] = rowData[header] || ''
        }
      })

      const contact: Contact = {
        id: `contact-${Date.now()}-${i}`,
        name: rowData.name,
        phone: cleanPhone,
        email: rowData.email || undefined,
        company: rowData.company || undefined,
        customFields,
        status: 'pending',
        callHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      contacts.push(contact)
      validCount++
    }

    return {
      total: lines.length - 1,
      valid: validCount,
      invalid: invalidCount,
      errors: errors.slice(0, 10), // Limit to first 10 errors
      preview: contacts.slice(0, 5) // Show first 5 contacts as preview
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const csvText = e.target?.result as string
      const result = parseCSV(csvText)
      setUploadResult(result)
      setIsUploading(false)
    }
    
    reader.onerror = () => {
      toast.error('Error reading file')
      setIsUploading(false)
    }
    
    reader.readAsText(file)
  }

  const handleCreateContactList = () => {
    if (!uploadResult || !newListName.trim()) {
      toast.error('Please provide a list name and upload contacts')
      return
    }

    if (uploadResult.valid === 0) {
      toast.error('No valid contacts found')
      return
    }

    // Get all contacts from the parsed result
    if (fileInputRef.current?.files?.[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target?.result as string
        const lines = csvText.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        const allContacts: Contact[] = []
        
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(cell => cell.trim())
          if (row.length === headers.length) {
            const rowData: any = {}
            headers.forEach((header, index) => {
              rowData[header] = row[index]
            })

            const cleanPhone = rowData.phone?.replace(/[\s\-\(\)]/g, '') || ''
            const phoneRegex = /^[\+]?[1-9][\d]{3,14}$/
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

            if (rowData.name && cleanPhone && phoneRegex.test(cleanPhone)) {
              if (!rowData.email || emailRegex.test(rowData.email)) {
                const customFields: { [key: string]: string } = {}
                headers.forEach(header => {
                  if (!['name', 'phone', 'email', 'company'].includes(header)) {
                    customFields[header] = rowData[header] || ''
                  }
                })

                allContacts.push({
                  id: `contact-${Date.now()}-${i}-${Math.random()}`,
                  name: rowData.name,
                  phone: cleanPhone,
                  email: rowData.email || undefined,
                  company: rowData.company || undefined,
                  customFields,
                  status: 'pending',
                  callHistory: [],
                  createdAt: new Date(),
                  updatedAt: new Date()
                })
              }
            }
          }
        }

        const newContactList: Omit<ContactList, 'id' | 'createdAt' | 'updatedAt'> = {
          name: newListName,
          userId: 'current-user', // This should come from auth context
          contacts: allContacts,
          totalContacts: allContacts.length,
          validContacts: allContacts.length,
          invalidContacts: uploadResult.invalid
        }

        addContactList(newContactList)
        toast.success(`Contact list "${newListName}" created with ${allContacts.length} contacts`)
        
        // Reset form
        setShowUploadModal(false)
        setUploadResult(null)
        setNewListName('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsText(fileInputRef.current.files[0])
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contacts_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredContacts = activeList?.contacts.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Contact Management</h2>
          <p className="text-gray-400 mt-1">Upload and manage your contact lists for campaigns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={downloadTemplate}
            className="btn-secondary px-4 py-2 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary px-4 py-2 flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Contacts
          </button>
        </div>
      </div>

      {/* Contact Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lists Sidebar */}
        <div className="dashboard-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            Contact Lists
          </h3>
          
          <div className="space-y-2">
            {contactLists.map((list) => (
              <div
                key={list.id}
                onClick={() => setActiveList(list)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  activeList?.id === list.id 
                    ? 'bg-blue-600/20 border border-blue-500' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{list.name}</h4>
                    <p className="text-sm text-gray-400">{list.totalContacts} contacts</p>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 text-sm">{list.validContacts} valid</span>
                    {list.invalidContacts > 0 && (
                      <span className="text-red-400 text-sm block">{list.invalidContacts} invalid</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {contactLists.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <p className="text-gray-400">No contact lists yet</p>
                <p className="text-gray-500 text-sm">Upload a CSV file to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="lg:col-span-2">
          {activeList ? (
            <div className="dashboard-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{activeList.name}</h3>
                  <p className="text-gray-400">
                    {filteredContacts.length} of {activeList.totalContacts} contacts
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search contacts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="called">Called</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

              {/* Contacts Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Name</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Phone</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Email</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Company</th>
                      <th className="text-left py-3 px-2 text-gray-400 text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.map((contact) => (
                      <tr key={contact.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-3 px-2 text-white">{contact.name}</td>
                        <td className="py-3 px-2 text-gray-300">{contact.phone}</td>
                        <td className="py-3 px-2 text-gray-300">{contact.email || '-'}</td>
                        <td className="py-3 px-2 text-gray-300">{contact.company || '-'}</td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            contact.status === 'success' ? 'bg-green-400/20 text-green-400' :
                            contact.status === 'failed' ? 'bg-red-400/20 text-red-400' :
                            contact.status === 'called' ? 'bg-blue-400/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {contact.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredContacts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No contacts found</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="dashboard-card rounded-xl p-6">
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a Contact List</h3>
                <p className="text-gray-400">Choose a contact list from the sidebar to view and manage contacts</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Upload Contact List</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">List Name *</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Q1 Sales Prospects"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Upload CSV File *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Required columns: name, phone. Optional: email, company, custom fields
                </p>
              </div>

              {isUploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Processing CSV...</p>
                </div>
              )}

              {uploadResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="text-2xl font-bold text-white">{uploadResult.total}</div>
                      <div className="text-gray-400 text-sm">Total Rows</div>
                    </div>
                    <div className="bg-green-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-400">{uploadResult.valid}</div>
                      <div className="text-gray-400 text-sm">Valid Contacts</div>
                    </div>
                    <div className="bg-red-900/20 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-400">{uploadResult.invalid}</div>
                      <div className="text-gray-400 text-sm">Invalid Rows</div>
                    </div>
                  </div>

                  {uploadResult.errors.length > 0 && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                        <h4 className="font-medium text-red-400">Validation Errors</h4>
                      </div>
                      <ul className="text-red-300 text-sm space-y-1">
                        {uploadResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {uploadResult.preview.length > 0 && (
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                        <h4 className="font-medium text-green-400">Preview (First 5 contacts)</h4>
                      </div>
                      <div className="space-y-2">
                        {uploadResult.preview.map((contact, index) => (
                          <div key={index} className="text-sm text-gray-300">
                            {contact.name} - {contact.phone} {contact.email && `- ${contact.email}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContactList}
                  disabled={!uploadResult || uploadResult.valid === 0 || !newListName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create Contact List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 