import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Car, Settings } from '../../lib/database.types'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import toast from 'react-hot-toast'

interface LineItemForm {
  id: string
  name: string
  qty: string
  unit_price: string
  tax_flag: boolean
}

const REMINDER_WEEKS_OPTIONS = [2, 4, 6, 8, 12]

const QUICK_ITEMS = [
  { name: 'Oil Change', price: 89 },
  { name: 'Oil Filter', price: 25 },
  { name: 'Air Filter', price: 35 },
  { name: 'Brake Pads (Front)', price: 180 },
  { name: 'Brake Pads (Rear)', price: 160 },
  { name: 'Tyre - 195/65R15', price: 120 },
  { name: 'Tyre - 205/55R16', price: 140 },
  { name: 'Wheel Alignment', price: 79 },
  { name: 'Wheel Balance', price: 40 },
  { name: 'Labour (per hour)', price: 95 },
]

export function ServiceFormPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preSelectedCarId = searchParams.get('car')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  const [formData, setFormData] = useState({
    car_id: preSelectedCarId || '',
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    odometer_km: '',
    reminder_weeks: 8,
    notes: '',
    mark_paid: false,
    payment_method: 'Cash' as const,
  })

  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { id: crypto.randomUUID(), name: '', qty: '1', unit_price: '', tax_flag: true }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [carsRes, settingsRes] = await Promise.all([
      supabase.from('cars').select('*').order('rego_plate'),
      supabase.from('settings').select('*').single()
    ])

    if (carsRes.data) setCars(carsRes.data)
    if (settingsRes.data) {
      setSettings(settingsRes.data)
      setFormData(prev => ({
        ...prev,
        reminder_weeks: settingsRes.data.default_reminder_weeks || 8
      }))
    }
    setLoading(false)
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), name: '', qty: '1', unit_price: '', tax_flag: true }
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return
    setLineItems(lineItems.filter(item => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItemForm, value: string | boolean) => {
    setLineItems(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const addQuickItem = (item: { name: string; price: number }) => {
    const existing = lineItems.find(li => li.name === item.name)
    if (existing) {
      updateLineItem(existing.id, 'qty', (parseFloat(existing.qty) + 1).toString())
    } else {
      // Find first empty line or add new
      const emptyLine = lineItems.find(li => !li.name && !li.unit_price)
      if (emptyLine) {
        updateLineItem(emptyLine.id, 'name', item.name)
        updateLineItem(emptyLine.id, 'unit_price', item.price.toString())
      } else {
        setLineItems([
          ...lineItems,
          { id: crypto.randomUUID(), name: item.name, qty: '1', unit_price: item.price.toString(), tax_flag: true }
        ])
      }
    }
  }

  const calculateTotals = () => {
    const taxRate = settings?.default_tax_rate || 10
    let subtotal = 0
    let taxableAmount = 0

    lineItems.forEach(item => {
      const qty = parseFloat(item.qty) || 0
      const price = parseFloat(item.unit_price) || 0
      const lineTotal = qty * price
      subtotal += lineTotal
      if (item.tax_flag) {
        taxableAmount += lineTotal
      }
    })

    const taxTotal = taxableAmount * (taxRate / 100)
    const total = subtotal + taxTotal

    return { subtotal, taxTotal, total, taxRate }
  }

  const { subtotal, taxTotal, total, taxRate } = calculateTotals()
  const nextServiceDate = addWeeks(new Date(formData.visit_date), formData.reminder_weeks)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.car_id) {
      toast.error('Please select a car')
      return
    }

    const validLineItems = lineItems.filter(item => item.name && parseFloat(item.unit_price) > 0)
    if (validLineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    setSaving(true)

    try {
      // 1. Create service visit
      const { data: visit, error: visitError } = await supabase
        .from('service_visits')
        .insert({
          car_id: formData.car_id,
          visit_date: formData.visit_date,
          odometer_km: formData.odometer_km ? parseInt(formData.odometer_km) : null,
          reminder_weeks: formData.reminder_weeks,
          next_service_due_date: format(nextServiceDate, 'yyyy-MM-dd'),
          notes: formData.notes || null,
        })
        .select()
        .single()

      if (visitError) throw visitError

      // 2. Create line items
      const lineItemsData = validLineItems.map((item, index) => ({
        visit_id: visit.id,
        name: item.name,
        qty: parseFloat(item.qty) || 1,
        unit_price: parseFloat(item.unit_price) || 0,
        tax_flag: item.tax_flag,
        sort_order: index,
      }))

      const { error: lineItemsError } = await supabase
        .from('line_items')
        .insert(lineItemsData)

      if (lineItemsError) throw lineItemsError

      // 3. Create invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          visit_id: visit.id,
          subtotal,
          tax_rate: taxRate,
          tax_total: taxTotal,
          total,
          status: formData.mark_paid ? 'Paid' : 'Draft',
          paid_date: formData.mark_paid ? formData.visit_date : null,
          payment_method: formData.mark_paid ? formData.payment_method : null,
        })

      if (invoiceError) throw invoiceError

      toast.success('Service visit created successfully')
      navigate(`/crm/cars/${formData.car_id}`)
    } catch (error: any) {
      console.error('Error creating service:', error)
      toast.error(error.message || 'Failed to create service')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to={preSelectedCarId ? `/crm/cars/${preSelectedCarId}` : '/crm/cars'}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Service Visit</h1>
          <p className="text-slate-400">Record service and create invoice</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Service Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Car Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Vehicle <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.car_id}
                onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a vehicle</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.rego_plate} - {car.make} {car.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Visit Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Odometer */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Odometer (km)</label>
              <input
                type="number"
                value={formData.odometer_km}
                onChange={(e) => setFormData({ ...formData, odometer_km: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Current km reading"
              />
            </div>

            {/* Reminder Weeks */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Next Service In</label>
              <select
                value={formData.reminder_weeks}
                onChange={(e) => setFormData({ ...formData, reminder_weeks: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {REMINDER_WEEKS_OPTIONS.map((weeks) => (
                  <option key={weeks} value={weeks}>{weeks} weeks</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Next service: {format(nextServiceDate, 'dd MMM yyyy')}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Service notes..."
            />
          </div>
        </div>

        {/* Quick Add Items */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Add</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_ITEMS.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => addQuickItem(item)}
                className="px-3 py-1.5 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
              >
                {item.name} ({formatCurrency(item.price)})
              </button>
            ))}
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>

          <div className="space-y-3">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-2 text-sm text-slate-400 px-2">
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {lineItems.map((item) => {
              const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unit_price) || 0)
              return (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-12 md:col-span-5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.qty}
                      onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right text-white font-medium text-sm pr-2">
                    {formatCurrency(lineTotal)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST ({taxRate}%)</span>
              <span>{formatCurrency(taxTotal)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-slate-600">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Payment</h2>
              <p className="text-sm text-slate-400">Mark this invoice as paid now?</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mark_paid: !formData.mark_paid })}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                formData.mark_paid ? 'bg-green-500' : 'bg-slate-600'
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                formData.mark_paid ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {formData.mark_paid && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full md:w-48 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            to={preSelectedCarId ? `/crm/cars/${preSelectedCarId}` : '/crm/cars'}
            className="px-6 py-2 text-slate-300 hover:text-white transition-colors"
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
            Create Service
          </button>
        </div>
      </form>
    </div>
  )
}

