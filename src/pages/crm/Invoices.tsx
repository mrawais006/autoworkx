import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  FileText, 
  Plus, 
  Search, 
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceWithDetails {
  id: string
  invoice_number: string | null
  created_at: string | null
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'
  total: number
  subtotal: number
  tax_total: number
  visit_id: string
  paid_date: string | null
  payment_method: string | null
  service_visits: {
    visit_date: string
    cars: {
      rego_plate: string
      make: string | null
      model: string | null
      companies: { name: string } | null
      customers: { full_name: string } | null
    }
  } | null
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        service_visits (
          visit_date,
          cars (
            rego_plate,
            make,
            model,
            companies (name),
            customers (full_name)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
    } else {
      setInvoices(data || [])
    }
    setLoading(false)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = search.toLowerCase()
    const car = invoice.service_visits?.cars
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      car?.rego_plate?.toLowerCase().includes(searchLower) ||
      car?.companies?.name?.toLowerCase().includes(searchLower) ||
      car?.customers?.full_name?.toLowerCase().includes(searchLower)
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'Sent':
        return <Send className="w-4 h-4 text-blue-400" />
      case 'Overdue':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-amber-400" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Sent':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Overdue':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    }
  }

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    pending: invoices.filter(i => i.status === 'Draft' || i.status === 'Sent').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    totalRevenue: invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0),
    totalOutstanding: invoices.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.total, 0),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400">Manage and track all invoices</p>
        </div>
        <Link
          to="/crm/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Invoice
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Invoices</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Revenue</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(stats.totalOutstanding)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, rego, company, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-slate-400">No invoices found</p>
            <Link
              to="/crm/invoices/new"
              className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300"
            >
              <Plus className="w-4 h-4" />
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Invoice #</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Customer/Company</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Vehicle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-400">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredInvoices.map((invoice) => {
                  const car = invoice.service_visits?.cars
                  const customerName = car?.companies?.name || car?.customers?.full_name || '-'
                  
                  return (
                    <tr key={invoice.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-medium text-white">
                          {invoice.invoice_number || 'DRAFT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {invoice.created_at 
                          ? format(new Date(invoice.created_at), 'dd MMM yyyy')
                          : '-'
                        }
                      </td>
                      <td className="py-3 px-4 text-white">{customerName}</td>
                      <td className="py-3 px-4">
                        <span className="text-white">{car?.rego_plate || '-'}</span>
                        {car?.make && (
                          <span className="text-slate-400 text-sm ml-2">
                            {car.make} {car.model}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyle(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-white">{formatCurrency(invoice.total)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            to={`/crm/invoices/${invoice.id}`}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/crm/invoices/${invoice.id}?action=download`}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

