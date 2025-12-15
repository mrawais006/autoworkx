import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Company } from '../../lib/database.types'
import { Search, Plus, Building2, Phone, Mail, Edit, Trash2, X, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    primary_phone: '',
    primary_email: '',
    billing_address: '',
    notes: '',
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching companies:', error)
    } else {
      setCompanies(data || [])
    }
    setLoading(false)
  }

  const filteredCompanies = companies.filter((company) => {
    const searchLower = search.toLowerCase()
    return (
      company.name.toLowerCase().includes(searchLower) ||
      company.primary_phone?.includes(search) ||
      company.primary_email?.toLowerCase().includes(searchLower)
    )
  })

  const openModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company)
      setFormData({
        name: company.name,
        primary_phone: company.primary_phone || '',
        primary_email: company.primary_email || '',
        billing_address: company.billing_address || '',
        notes: company.notes || '',
      })
    } else {
      setEditingCompany(null)
      setFormData({ name: '', primary_phone: '', primary_email: '', billing_address: '', notes: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCompany(null)
    setFormData({ name: '', primary_phone: '', primary_email: '', billing_address: '', notes: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const companyData = {
      name: formData.name.trim(),
      primary_phone: formData.primary_phone.trim() || null,
      primary_email: formData.primary_email.trim() || null,
      billing_address: formData.billing_address.trim() || null,
      notes: formData.notes.trim() || null,
    }

    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('id', editingCompany.id)

        if (error) throw error
        toast.success('Company updated')
      } else {
        const { error } = await supabase
          .from('companies')
          .insert(companyData)

        if (error) throw error
        toast.success('Company created')
      }

      closeModal()
      fetchCompanies()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save company')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`Delete ${company.name}? This cannot be undone.`)) return

    const { error } = await supabase.from('companies').delete().eq('id', company.id)
    
    if (error) {
      toast.error('Failed to delete company')
    } else {
      toast.success('Company deleted')
      fetchCompanies()
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
          <h1 className="text-2xl font-bold text-white">Companies</h1>
          <p className="text-slate-400">{companies.length} companies</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Company
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Companies List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              {search ? 'No companies found' : 'No companies yet'}
            </h3>
            <p className="text-slate-400 mb-4">
              {search ? 'Try a different search term' : 'Add your first company to get started'}
            </p>
            {!search && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add Company
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{company.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      {company.primary_phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {company.primary_phone}
                        </span>
                      )}
                      {company.primary_email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {company.primary_email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(company)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(company)}
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
                {editingCompany ? 'Edit Company' : 'Add Company'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.primary_phone}
                  onChange={(e) => setFormData({ ...formData, primary_phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.primary_email}
                  onChange={(e) => setFormData({ ...formData, primary_email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  value={formData.billing_address}
                  onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Address"
                />
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
                  {editingCompany ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

