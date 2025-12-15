import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Receipt, Search, Check, X, Loader2, Car, Building2, User } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface UnpaidInvoice {
  invoice_id: string
  invoice_number: string
  visit_id: string
  total: number
  status: string
  visit_date: string
  rego_plate: string
  customer_name: string
  company_name: string
  days_overdue: number
}

export function PaymentsPage() {
  const [invoices, setInvoices] = useState<UnpaidInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<UnpaidInvoice | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'Cheque' | 'Other'>('Cash')

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    const { data, error } = await supabase.rpc('get_unpaid_invoices')
    
    if (error) {
      console.error('Error fetching invoices:', error)
    } else {
      setInvoices(data || [])
    }
    setLoading(false)
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = search.toLowerCase()
    return (
      invoice.invoice_number?.toLowerCase().includes(searchLower) ||
      invoice.rego_plate.toLowerCase().includes(searchLower) ||
      invoice.customer_name?.toLowerCase().includes(searchLower) ||
      invoice.company_name?.toLowerCase().includes(searchLower)
    )
  })

  const openPayModal = (invoice: UnpaidInvoice) => {
    setSelectedInvoice(invoice)
    setShowPayModal(true)
  }

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return
    
    setProcessingId(selectedInvoice.invoice_id)
    
    const { error } = await supabase
      .from('invoices')
      .update({
        status: 'Paid',
        paid_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: paymentMethod,
      })
      .eq('id', selectedInvoice.invoice_id)
    
    if (error) {
      toast.error('Failed to update invoice')
    } else {
      toast.success(`Invoice ${selectedInvoice.invoice_number} marked as paid`)
      setShowPayModal(false)
      setSelectedInvoice(null)
      fetchInvoices()
    }
    
    setProcessingId(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount)
  }

  const totalUnpaid = invoices.reduce((sum, inv) => sum + inv.total, 0)

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
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-slate-400">
            {invoices.length} unpaid invoices • {formatCurrency(totalUnpaid)} outstanding
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Total Outstanding</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalUnpaid)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Unpaid Invoices</p>
          <p className="text-2xl font-bold text-white">{invoices.length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-sm text-slate-400">Overdue (14+ days)</p>
          <p className="text-2xl font-bold text-red-400">
            {invoices.filter(i => i.days_overdue > 14).length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search invoices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Invoices List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              {search ? 'No invoices found' : 'All invoices paid!'}
            </h3>
            <p className="text-slate-400">
              {search ? 'Try a different search term' : 'Great job keeping up with payments'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.invoice_id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    invoice.days_overdue > 14 ? 'bg-red-500/20' : 
                    invoice.days_overdue > 7 ? 'bg-amber-500/20' : 'bg-blue-500/20'
                  }`}>
                    <Receipt className={`w-6 h-6 ${
                      invoice.days_overdue > 14 ? 'text-red-400' : 
                      invoice.days_overdue > 7 ? 'text-amber-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{invoice.invoice_number}</p>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        invoice.status === 'Overdue' ? 'bg-red-500/20 text-red-400' :
                        invoice.status === 'Sent' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-600 text-slate-300'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        {invoice.rego_plate}
                      </span>
                      {invoice.customer_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {invoice.customer_name}
                        </span>
                      )}
                      {invoice.company_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {invoice.company_name}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      invoice.days_overdue > 14 ? 'text-red-400' :
                      invoice.days_overdue > 7 ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {invoice.days_overdue === 0 ? 'Today' : `${invoice.days_overdue} days ago`}
                      {' • '}{format(new Date(invoice.visit_date), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{formatCurrency(invoice.total)}</p>
                  </div>
                  <button
                    onClick={() => openPayModal(invoice)}
                    disabled={processingId === invoice.invoice_id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {processingId === invoice.invoice_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Confirm Payment</h2>
              <button 
                onClick={() => setShowPayModal(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Invoice</span>
                  <span className="text-white font-medium">{selectedInvoice.invoice_number}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Vehicle</span>
                  <span className="text-white">{selectedInvoice.rego_plate}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-slate-300">Amount</span>
                  <span className="text-green-400">{formatCurrency(selectedInvoice.total)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'Cash' | 'Card' | 'Bank Transfer' | 'Cheque' | 'Other')}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkPaid}
                  disabled={!!processingId}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

