import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Company, Customer } from '../../lib/database.types'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export function CarFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const [formData, setFormData] = useState({
    rego_plate: '',
    make: '',
    model: '',
    year: '',
    vin: '',
    company_id: '',
    customer_id: '',
    driver_name: '',
    driver_phone: '',
    notes: '',
  })

  useEffect(() => {
    fetchOptions()
    if (isEdit) {
      fetchCar()
    }
  }, [id])

  const fetchOptions = async () => {
    const [companiesRes, customersRes] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('customers').select('*').order('full_name'),
    ])
    
    if (companiesRes.data) setCompanies(companiesRes.data)
    if (customersRes.data) setCustomers(customersRes.data)
  }

  const fetchCar = async () => {
    if (!id) return
    setLoading(true)
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      toast.error('Car not found')
      navigate('/crm/cars')
      return
    }

    setFormData({
      rego_plate: data.rego_plate || '',
      make: data.make || '',
      model: data.model || '',
      year: data.year?.toString() || '',
      vin: data.vin || '',
      company_id: data.company_id || '',
      customer_id: data.customer_id || '',
      driver_name: data.driver_name || '',
      driver_phone: data.driver_phone || '',
      notes: data.notes || '',
    })
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const carData = {
      rego_plate: formData.rego_plate.toUpperCase().trim(),
      make: formData.make.trim() || null,
      model: formData.model.trim() || null,
      year: formData.year ? parseInt(formData.year) : null,
      vin: formData.vin.trim() || null,
      company_id: formData.company_id || null,
      customer_id: formData.customer_id || null,
      driver_name: formData.driver_name.trim() || null,
      driver_phone: formData.driver_phone.trim() || null,
      notes: formData.notes.trim() || null,
    }

    // Snapshot company phone if company selected
    if (carData.company_id) {
      const company = companies.find(c => c.id === carData.company_id)
      if (company?.primary_phone) {
        (carData as any).company_phone_snapshot = company.primary_phone
      }
    }

    try {
      if (isEdit) {
        const { error } = await supabase
          .from('cars')
          .update(carData)
          .eq('id', id)

        if (error) throw error
        toast.success('Car updated successfully')
      } else {
        const { data, error } = await supabase
          .from('cars')
          .insert(carData)
          .select()
          .single()

        if (error) throw error
        toast.success('Car added successfully')
        navigate(`/crm/cars/${data.id}`)
        return
      }

      navigate(`/crm/cars/${id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save car')
    } finally {
      setSaving(false)
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={isEdit ? `/crm/cars/${id}` : '/crm/cars'}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Car' : 'Add New Car'}
          </h1>
          <p className="text-slate-400">
            {isEdit ? 'Update vehicle details' : 'Register a new vehicle'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        {/* Rego Plate */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Rego Plate <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.rego_plate}
            onChange={(e) => setFormData({ ...formData, rego_plate: e.target.value })}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ABC123"
          />
        </div>

        {/* Make & Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Make</label>
            <input
              type="text"
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Camry"
            />
          </div>
        </div>

        {/* Year & VIN */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Year</label>
            <input
              type="number"
              min="1900"
              max="2099"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2024"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">VIN (optional)</label>
            <input
              type="text"
              value={formData.vin}
              onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Vehicle ID Number"
            />
          </div>
        </div>

        {/* Company & Customer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Company (optional)</label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Customer (optional)</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Driver Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Driver Name</label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Driver's name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Driver Phone</label>
            <input
              type="tel"
              value={formData.driver_phone}
              onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0400 000 000"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Any additional notes..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <Link
            to={isEdit ? `/crm/cars/${id}` : '/crm/cars'}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEdit ? 'Update Car' : 'Add Car'}
          </button>
        </div>
      </form>
    </div>
  )
}

