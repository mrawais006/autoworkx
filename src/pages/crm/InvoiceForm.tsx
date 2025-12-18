import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Company, Customer, Car, Settings } from '../../lib/database.types'
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Loader2,
  Building2,
  User,
  Car as CarIcon,
  Calculator,
  Search,
  ChevronDown,
  X
} from 'lucide-react'
import { format, addWeeks } from 'date-fns'
import toast from 'react-hot-toast'

interface LineItemForm {
  id: string
  name: string
  qty: string
  unit_price: string
  tax_flag: boolean
}

interface CarWithRelations extends Car {
  companies?: Company | null
  customers?: Customer | null
}

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

// Searchable Select Component
interface SearchableSelectProps<T> {
  label: string
  placeholder: string
  value: string
  options: T[]
  getOptionValue: (option: T) => string
  getOptionLabel: (option: T) => string
  getOptionSubLabel?: (option: T) => string | undefined
  onChange: (value: string) => void
  required?: boolean
  icon?: React.ReactNode
}

function SearchableSelect<T>({
  label,
  placeholder,
  value,
  options,
  getOptionValue,
  getOptionLabel,
  getOptionSubLabel,
  onChange,
  required,
  icon
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find(o => getOptionValue(o) === value)
  
  const filteredOptions = options.filter(option => {
    const searchLower = search.toLowerCase()
    const label = getOptionLabel(option).toLowerCase()
    const subLabel = getOptionSubLabel?.(option)?.toLowerCase() || ''
    return label.includes(searchLower) || subLabel.includes(searchLower)
  })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm text-slate-400 mb-2">
        {label} {required && '*'}
      </label>
      
      <div
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
        className={`
          w-full px-4 py-2 bg-slate-700 border rounded-lg text-white cursor-pointer
          flex items-center justify-between gap-2
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-600'}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon}
          {selectedOption ? (
            <span className="truncate">{getOptionLabel(selectedOption)}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-600 rounded"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-600">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {!required && (
              <div
                onClick={() => handleSelect('')}
                className="px-4 py-2 hover:bg-slate-600 cursor-pointer text-slate-400"
              >
                -- None --
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-slate-400 text-sm text-center">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const optionValue = getOptionValue(option)
                const isSelected = optionValue === value
                return (
                  <div
                    key={optionValue}
                    onClick={() => handleSelect(optionValue)}
                    className={`
                      px-4 py-2 cursor-pointer
                      ${isSelected ? 'bg-blue-600 text-white' : 'hover:bg-slate-600 text-white'}
                    `}
                  >
                    <div className="font-medium">{getOptionLabel(option)}</div>
                    {getOptionSubLabel && (
                      <div className={`text-sm ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                        {getOptionSubLabel(option)}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function InvoiceFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = !!id
  
  const preSelectedCompanyId = searchParams.get('company')
  const preSelectedCustomerId = searchParams.get('customer')
  const preSelectedCarId = searchParams.get('car')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cars, setCars] = useState<CarWithRelations[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)

  const [formData, setFormData] = useState({
    company_id: preSelectedCompanyId || '',
    customer_id: preSelectedCustomerId || '',
    car_id: preSelectedCarId || '',
    visit_date: format(new Date(), 'yyyy-MM-dd'),
    odometer_km: '',
    reminder_weeks: 8,
    notes: '',
    invoice_notes: '',
    mark_paid: false,
    payment_method: 'Cash' as 'Cash' | 'Card' | 'Bank Transfer' | 'Cheque' | 'Other',
  })

  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { id: crypto.randomUUID(), name: '', qty: '1', unit_price: '', tax_flag: true }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [companiesRes, customersRes, carsRes, settingsRes] = await Promise.all([
      supabase.from('companies').select('*').order('name'),
      supabase.from('customers').select('*').order('full_name'),
      supabase.from('cars').select('*, companies(*), customers(*)').order('rego_plate'),
      supabase.from('settings').select('*').single()
    ])

    if (companiesRes.data) setCompanies(companiesRes.data)
    if (customersRes.data) setCustomers(customersRes.data)
    if (carsRes.data) setCars(carsRes.data)
    if (settingsRes.data) {
      setSettings(settingsRes.data)
      setFormData(prev => ({
        ...prev,
        reminder_weeks: settingsRes.data.default_reminder_weeks || 8
      }))
    }

    // If editing, load existing invoice data
    if (id) {
      await fetchExistingInvoice()
    }

    setLoading(false)
  }

  const fetchExistingInvoice = async () => {
    if (!id) return

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        service_visits (
          *,
          cars (*, companies(*), customers(*)),
          line_items (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      toast.error('Invoice not found')
      navigate('/crm/invoices')
      return
    }

    const visit = data.service_visits
    const car = visit?.cars

    setFormData({
      company_id: car?.company_id || '',
      customer_id: car?.customer_id || '',
      car_id: visit?.car_id || '',
      visit_date: visit?.visit_date || format(new Date(), 'yyyy-MM-dd'),
      odometer_km: visit?.odometer_km?.toString() || '',
      reminder_weeks: visit?.reminder_weeks || 8,
      notes: visit?.notes || '',
      invoice_notes: data.notes || '',
      mark_paid: data.status === 'Paid',
      payment_method: (data.payment_method as typeof formData.payment_method) || 'Cash',
    })

    if (visit?.line_items && visit.line_items.length > 0) {
      setLineItems(visit.line_items.map((item: { id: string; name: string; qty: number; unit_price: number; tax_flag: boolean | null }) => ({
        id: item.id,
        name: item.name,
        qty: item.qty.toString(),
        unit_price: item.unit_price.toString(),
        tax_flag: item.tax_flag ?? true
      })))
    }
  }

  // When a car is selected, auto-populate company and customer from the car
  const handleCarSelect = (carId: string) => {
    const selectedCar = cars.find(c => c.id === carId)
    setFormData(prev => ({
      ...prev,
      car_id: carId,
      // Auto-populate company and customer from the selected car
      company_id: selectedCar?.company_id || prev.company_id,
      customer_id: selectedCar?.customer_id || prev.customer_id,
    }))
  }

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: crypto.randomUUID(), name: '', qty: '1', unit_price: '', tax_flag: true }
    ])
  }

  const removeLineItem = (itemId: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== itemId))
    }
  }

  const updateLineItem = (itemId: string, field: keyof LineItemForm, value: string | boolean) => {
    setLineItems(lineItems.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    ))
  }

  const addQuickItem = (quickItem: { name: string; price: number }) => {
    const existingItem = lineItems.find(item => !item.name && !item.unit_price)
    if (existingItem) {
      updateLineItem(existingItem.id, 'name', quickItem.name)
      updateLineItem(existingItem.id, 'unit_price', quickItem.price.toString())
    } else {
      setLineItems([
        ...lineItems,
        { id: crypto.randomUUID(), name: quickItem.name, qty: '1', unit_price: quickItem.price.toString(), tax_flag: true }
      ])
    }
  }

  // Calculate totals
  const taxRate = settings?.default_tax_rate || 10
  const validLineItems = lineItems.filter(item => item.name && parseFloat(item.unit_price) > 0)
  
  const subtotal = validLineItems.reduce((sum, item) => {
    const qty = parseFloat(item.qty) || 1
    const price = parseFloat(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)

  const taxableAmount = validLineItems.reduce((sum, item) => {
    if (!item.tax_flag) return sum
    const qty = parseFloat(item.qty) || 1
    const price = parseFloat(item.unit_price) || 0
    return sum + (qty * price)
  }, 0)

  const taxTotal = (taxableAmount * taxRate) / 100
  const total = subtotal + taxTotal

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2
    }).format(amount)

  const nextServiceDate = addWeeks(new Date(formData.visit_date), formData.reminder_weeks)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.car_id) {
      toast.error('Please select a vehicle')
      return
    }

    if (validLineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    setSaving(true)

    try {
      if (isEdit) {
        // Update existing invoice - fetch the visit_id first
        const { data: invoiceData } = await supabase
          .from('invoices')
          .select('visit_id')
          .eq('id', id)
          .single()

        if (!invoiceData) throw new Error('Invoice not found')

        // Update service visit
        const { error: visitError } = await supabase
          .from('service_visits')
          .update({
            car_id: formData.car_id,
            visit_date: formData.visit_date,
            odometer_km: formData.odometer_km ? parseInt(formData.odometer_km) : null,
            reminder_weeks: formData.reminder_weeks,
            next_service_due_date: format(nextServiceDate, 'yyyy-MM-dd'),
            notes: formData.notes || null,
          })
          .eq('id', invoiceData.visit_id)

        if (visitError) throw visitError

        // Delete existing line items and re-create
        await supabase.from('line_items').delete().eq('visit_id', invoiceData.visit_id)

        const lineItemsData = validLineItems.map((item, index) => ({
          visit_id: invoiceData.visit_id,
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

        // Update invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            subtotal,
            tax_rate: taxRate,
            tax_total: taxTotal,
            total,
            notes: formData.invoice_notes || null,
            status: formData.mark_paid ? 'Paid' : 'Draft',
            paid_date: formData.mark_paid ? formData.visit_date : null,
            payment_method: formData.mark_paid ? formData.payment_method : null,
          })
          .eq('id', id)

        if (invoiceError) throw invoiceError

        toast.success('Invoice updated successfully')
        navigate(`/crm/invoices/${id}`)
      } else {
        // Create new invoice
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
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            visit_id: visit.id,
            subtotal,
            tax_rate: taxRate,
            tax_total: taxTotal,
            total,
            notes: formData.invoice_notes || null,
            status: formData.mark_paid ? 'Paid' : 'Draft',
            paid_date: formData.mark_paid ? formData.visit_date : null,
            payment_method: formData.mark_paid ? formData.payment_method : null,
          })
          .select()
          .single()

        if (invoiceError) throw invoiceError

        toast.success('Invoice created successfully')
        navigate(`/crm/invoices/${invoice.id}`)
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    } finally {
      setSaving(false)
    }
  }

  const selectedCar = cars.find(c => c.id === formData.car_id)
  const selectedCompany = companies.find(c => c.id === formData.company_id) || selectedCar?.companies
  const selectedCustomer = customers.find(c => c.id === formData.customer_id) || selectedCar?.customers

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/crm/invoices"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <p className="text-slate-400">
            {isEdit ? 'Update invoice details' : 'Create a professional invoice'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer/Company Selection */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" />
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Searchable Company Select */}
            <SearchableSelect
              label="Company"
              placeholder="Select Company"
              value={formData.company_id}
              options={companies}
              getOptionValue={(c) => c.id}
              getOptionLabel={(c) => c.name}
              getOptionSubLabel={(c) => c.primary_phone || c.primary_email || undefined}
              onChange={(value) => setFormData({ ...formData, company_id: value })}
              icon={<Building2 className="w-4 h-4 text-purple-400" />}
            />

            {/* Searchable Customer Select */}
            <SearchableSelect
              label="Customer"
              placeholder="Select Customer"
              value={formData.customer_id}
              options={customers}
              getOptionValue={(c) => c.id}
              getOptionLabel={(c) => c.full_name}
              getOptionSubLabel={(c) => c.phone || c.email || undefined}
              onChange={(value) => setFormData({ ...formData, customer_id: value })}
              icon={<User className="w-4 h-4 text-blue-400" />}
            />

            {/* Searchable Vehicle Select */}
            <SearchableSelect
              label="Vehicle"
              placeholder="Select Vehicle"
              value={formData.car_id}
              options={cars}
              getOptionValue={(c) => c.id}
              getOptionLabel={(c) => c.rego_plate}
              getOptionSubLabel={(c) => `${c.make || ''} ${c.model || ''} ${c.year ? `(${c.year})` : ''}`.trim() || undefined}
              onChange={handleCarSelect}
              required
              icon={<CarIcon className="w-4 h-4 text-green-400" />}
            />
          </div>

          {/* Selected Customer Info */}
          {(selectedCompany || selectedCustomer || selectedCar) && (
            <div className="mt-4 p-4 bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCompany && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">{selectedCompany.name}</p>
                    {selectedCompany.primary_email && (
                      <p className="text-sm text-slate-400">{selectedCompany.primary_email}</p>
                    )}
                    {selectedCompany.primary_phone && (
                      <p className="text-sm text-slate-400">{selectedCompany.primary_phone}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedCustomer && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">{selectedCustomer.full_name}</p>
                    {selectedCustomer.email && (
                      <p className="text-sm text-slate-400">{selectedCustomer.email}</p>
                    )}
                    {selectedCustomer.phone && (
                      <p className="text-sm text-slate-400">{selectedCustomer.phone}</p>
                    )}
                  </div>
                </div>
              )}
              {selectedCar && (
                <div className="flex items-start gap-3">
                  <CarIcon className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">{selectedCar.rego_plate}</p>
                    <p className="text-sm text-slate-400">
                      {selectedCar.make} {selectedCar.model} {selectedCar.year && `(${selectedCar.year})`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service Details */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Service Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Invoice Date *</label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Odometer (km)</label>
              <input
                type="number"
                value={formData.odometer_km}
                onChange={(e) => setFormData({ ...formData, odometer_km: e.target.value })}
                placeholder="e.g. 85000"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Next Service Reminder</label>
              <select
                value={formData.reminder_weeks}
                onChange={(e) => setFormData({ ...formData, reminder_weeks: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 weeks</option>
                <option value={4}>4 weeks</option>
                <option value={6}>6 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-slate-400 mb-2">Service Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Notes about the service performed..."
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Line Items
            </h2>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* Quick Add Items */}
          <div className="mb-4">
            <p className="text-sm text-slate-400 mb-2">Quick Add:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ITEMS.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addQuickItem(item)}
                  className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 hover:text-white transition-colors"
                >
                  {item.name} (${item.price})
                </button>
              ))}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-sm font-medium text-slate-400">Description</th>
                  <th className="text-center py-2 px-2 text-sm font-medium text-slate-400 w-20">Qty</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-28">Unit Price</th>
                  <th className="text-center py-2 px-2 text-sm font-medium text-slate-400 w-16">GST</th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-slate-400 w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => {
                  const qty = parseFloat(item.qty) || 0
                  const price = parseFloat(item.unit_price) || 0
                  const lineTotal = qty * price

                  return (
                    <tr key={item.id} className="border-b border-slate-700/50">
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateLineItem(item.id, 'qty', e.target.value)}
                          min="1"
                          step="0.5"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={item.tax_flag}
                          onChange={(e) => updateLineItem(item.id, 'tax_flag', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="py-2 px-2 text-right text-white font-medium">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="p-1.5 text-slate-400 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST ({taxRate}%)</span>
                <span className="text-white">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700 text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Notes & Payment */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Additional Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Invoice Notes (shown on invoice)</label>
              <textarea
                value={formData.invoice_notes}
                onChange={(e) => setFormData({ ...formData, invoice_notes: e.target.value })}
                rows={2}
                placeholder="Additional notes to display on the invoice..."
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.mark_paid}
                  onChange={(e) => setFormData({ ...formData, mark_paid: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-green-600 focus:ring-green-500"
                />
                <span className="text-white">Mark as Paid</span>
              </label>

              {formData.mark_paid && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as typeof formData.payment_method })}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/crm/invoices"
            className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Update Invoice' : 'Create Invoice'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
