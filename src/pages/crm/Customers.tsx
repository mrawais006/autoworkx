import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Customer, Company } from '../../lib/database.types'
import { Search, Plus, User, Phone, Mail, Building2, Edit, Trash2, X, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface CustomerWithCompany extends Customer {
  companies?: Company | null
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithCompany[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    company_id: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [customersRes, companiesRes] = await Promise.all([
      supabase
        .from('customers')
        .select('*, companies:company_id(*)')
        .order('full_name'),
      supabase.from('companies').select('*').order('name')
    ])

    if (customersRes.data) setCustomers(customersRes.data)
    if (companiesRes.data) setCompanies(companiesRes.data)
    setLoading(false)
  }

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase()
    return (
      customer.full_name.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(search) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      (customer.companies as any)?.name?.toLowerCase().includes(searchLower)
    )
  })

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        full_name: customer.full_name,
        phone: customer.phone || '',
        email: customer.email || '',
        company_id: customer.company_id || '',
        notes: customer.notes || '',
      })
    } else {
      setEditingCustomer(null)
      setFormData({ full_name: '', phone: '', email: '', company_id: '', notes: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCustomer(null)
    setFormData({ full_name: '', phone: '', email: '', company_id: '', notes: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const customerData = {
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim() || null,
      email: formData.email.trim() || null,
      company_id: formData.company_id || null,
      notes: formData.notes.trim() || null,
    }

    try {
      if (editingCustomer) {
        const { error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', editingCustomer.id)

        if (error) throw error
        toast.success('Customer updated')
      } else {
        const { error } = await supabase
          .from('customers')
          .insert(customerData)

        if (error) throw error
        toast.success('Customer created')
      }

      closeModal()
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save customer')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Delete ${customer.full_name}? This cannot be undone.`)) return

    const { error } = await supabase.from('customers').delete().eq('id', customer.id)
    
    if (error) {
      toast.error('Failed to delete customer')
    } else {
      toast.success('Customer deleted')
      fetchData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400">{customers.length} customers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customers List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              {search ? 'No customers found' : 'No customers yet'}
            </h3>
            <p className="text-slate-400 mb-4">
              {search ? 'Try a different search term' : 'Add your first customer'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{customer.full_name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      {customer.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </span>
                      )}
                      {customer.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </span>
                      )}
                      {(customer.companies as any)?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {(customer.companies as any).name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(customer)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingCustomer ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

