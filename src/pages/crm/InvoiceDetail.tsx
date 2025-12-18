import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useReactToPrint } from 'react-to-print'
import { supabase } from '../../lib/supabase'
import { InvoicePDF, type InvoicePDFProps } from '../../components/crm/InvoicePDF'
import type { Invoice, LineItem, Settings } from '../../lib/database.types'
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Mail, 
  MessageCircle,
  Edit,
  Trash2,
  CheckCircle,
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface InvoiceWithDetails extends Invoice {
  service_visits: {
    id: string
    visit_date: string
    odometer_km: number | null
    notes: string | null
    cars: {
      id: string
      rego_plate: string
      make: string | null
      model: string | null
      year: number | null
      companies: {
        id: string
        name: string
        primary_email: string | null
        primary_phone: string | null
        billing_address: string | null
      } | null
      customers: {
        id: string
        full_name: string
        email: string | null
        phone: string | null
      } | null
    }
    line_items: LineItem[]
  }
}

const DEFAULT_TERMS = `1. Payment is due within 14 days of invoice date.
2. All prices include GST unless otherwise stated.
3. Warranty on parts and labour as per manufacturer specifications.
4. Please quote invoice number when making payment.`

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Bank Transfer' | 'Cheque' | 'Other'>('Cash')

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails()
    }
  }, [id])

  useEffect(() => {
    // Auto-trigger download if action=download in URL
    if (searchParams.get('action') === 'download' && invoice && settings) {
      handleDownloadPDF()
    }
  }, [searchParams, invoice, settings])

  const fetchInvoiceDetails = async () => {
    if (!id) return

    const [invoiceRes, settingsRes] = await Promise.all([
      supabase
        .from('invoices')
        .select(`
          *,
          service_visits (
            id,
            visit_date,
            odometer_km,
            notes,
            cars (
              id,
              rego_plate,
              make,
              model,
              year,
              companies (id, name, primary_email, primary_phone, billing_address),
              customers (id, full_name, email, phone)
            ),
            line_items (*)
          )
        `)
        .eq('id', id)
        .single(),
      supabase.from('settings').select('*').single()
    ])

    if (invoiceRes.error || !invoiceRes.data) {
      toast.error('Invoice not found')
      navigate('/crm/invoices')
      return
    }

    setInvoice(invoiceRes.data as InvoiceWithDetails)
    if (settingsRes.data) {
      setSettings(settingsRes.data)
    }
    setLoading(false)
  }

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoice?.invoice_number || 'Draft'}`,
    onAfterPrint: () => toast.success('Print dialog opened'),
  })

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return
    
    setProcessing(true)
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2
      const imgY = 0
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
      pdf.save(`Invoice-${invoice?.invoice_number || 'Draft'}.pdf`)
      
      toast.success('PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setProcessing(false)
    }
  }

  const handleEmailInvoice = () => {
    const car = invoice?.service_visits?.cars
    const email = car?.companies?.primary_email || car?.customers?.email
    
    if (!email) {
      toast.error('No email address found for this customer')
      return
    }

    const subject = encodeURIComponent(`Invoice ${invoice?.invoice_number || 'Draft'} from AutoWorkX & Tyres`)
    const body = encodeURIComponent(
      `Dear ${car?.companies?.name || car?.customers?.full_name || 'Customer'},\n\n` +
      `Please find attached your invoice ${invoice?.invoice_number || ''} for the service on your vehicle (${car?.rego_plate}).\n\n` +
      `Invoice Total: $${invoice?.total?.toFixed(2) || '0.00'}\n\n` +
      `If you have any questions, please don't hesitate to contact us.\n\n` +
      `Thank you for your business!\n\n` +
      `Best regards,\n${settings?.shop_name || 'AutoWorkX & Tyres'}\n` +
      `Phone: ${settings?.shop_phone || ''}\n` +
      `Email: ${settings?.shop_email || ''}`
    )

    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank')
    toast.success('Email client opened')
  }

  const handleWhatsApp = () => {
    const car = invoice?.service_visits?.cars
    const phone = car?.companies?.primary_phone || car?.customers?.phone
    
    if (!phone) {
      toast.error('No phone number found for this customer')
      return
    }

    // Clean the phone number
    const cleanPhone = phone.replace(/[^0-9+]/g, '')
    const internationalPhone = cleanPhone.startsWith('+') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
        ? '+61' + cleanPhone.slice(1) 
        : '+61' + cleanPhone

    const message = encodeURIComponent(
      `Hi ${car?.companies?.name || car?.customers?.full_name || 'there'},\n\n` +
      `Your invoice ${invoice?.invoice_number || ''} from AutoWorkX & Tyres is ready.\n\n` +
      `Vehicle: ${car?.rego_plate}\n` +
      `Total: $${invoice?.total?.toFixed(2) || '0.00'}\n\n` +
      `Thank you for choosing AutoWorkX & Tyres!`
    )

    window.open(`https://wa.me/${internationalPhone}?text=${message}`, '_blank')
    toast.success('WhatsApp opened')
  }

  const handleMarkAsSent = async () => {
    if (!id) return
    
    setProcessing(true)
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'Sent' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Invoice marked as sent')
      fetchInvoiceDetails()
    }
    setProcessing(false)
  }

  const handleMarkAsPaid = async () => {
    if (!id) return
    
    setProcessing(true)
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'Paid',
        paid_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: paymentMethod
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Invoice marked as paid')
      setShowPayModal(false)
      fetchInvoiceDetails()
    }
    setProcessing(false)
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return
    }

    setProcessing(true)
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete invoice')
      setProcessing(false)
    } else {
      toast.success('Invoice deleted')
      navigate('/crm/invoices')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!invoice || !settings) return null

  const car = invoice.service_visits?.cars
  const company = car?.companies
  const customer = car?.customers
  const lineItems = invoice.service_visits?.line_items || []

  const pdfProps: InvoicePDFProps = {
    invoice: {
      invoice_number: invoice.invoice_number,
      created_at: invoice.created_at,
      subtotal: invoice.subtotal,
      tax_rate: invoice.tax_rate,
      tax_total: invoice.tax_total,
      total: invoice.total,
      status: invoice.status,
      notes: invoice.notes,
      paid_date: invoice.paid_date,
      payment_method: invoice.payment_method
    },
    company: company ? {
      name: company.name,
      primary_email: company.primary_email,
      primary_phone: company.primary_phone,
      billing_address: company.billing_address
    } : null,
    customer: customer ? {
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone
    } : null,
    car: car ? {
      rego_plate: car.rego_plate,
      make: car.make,
      model: car.model,
      year: car.year
    } : null,
    lineItems: lineItems.map(item => ({
      name: item.name,
      qty: item.qty,
      unit_price: item.unit_price,
      tax_flag: item.tax_flag ?? true,
      line_total: item.line_total ?? undefined
    })),
    settings: {
      shop_name: settings.shop_name,
      shop_phone: settings.shop_phone,
      shop_email: settings.shop_email,
      shop_address: settings.shop_address,
      shop_abn: settings.shop_abn
    },
    terms: DEFAULT_TERMS
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/crm/invoices"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Invoice {invoice.invoice_number || 'Draft'}
            </h1>
            <p className="text-slate-400">
              {car?.rego_plate} • {company?.name || customer?.full_name || 'Customer'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => handlePrint()}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download
          </button>

          <button
            onClick={handleEmailInvoice}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>

          <button
            onClick={handleWhatsApp}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>

      {/* Status Actions */}
      <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex-1">
          <p className="text-sm text-slate-400">Status</p>
          <p className={`font-semibold ${
            invoice.status === 'Paid' ? 'text-green-400' :
            invoice.status === 'Overdue' ? 'text-red-400' :
            invoice.status === 'Sent' ? 'text-blue-400' :
            'text-amber-400'
          }`}>
            {invoice.status}
            {invoice.paid_date && ` on ${format(new Date(invoice.paid_date), 'dd MMM yyyy')}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'Draft' && (
            <button
              onClick={handleMarkAsSent}
              disabled={processing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Mark as Sent
            </button>
          )}

          {invoice.status !== 'Paid' && (
            <button
              onClick={() => setShowPayModal(true)}
              disabled={processing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </button>
          )}

          <Link
            to={`/crm/invoices/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 overflow-auto">
        <div className="min-w-[800px]">
          <InvoicePDF ref={invoiceRef} {...pdfProps} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-4 text-sm text-slate-400">
        <Link 
          to={`/crm/cars/${car?.id}`}
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Vehicle
        </Link>
        <Link 
          to={`/crm/service/${invoice.service_visits?.id}`}
          className="inline-flex items-center gap-1 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Service Visit
        </Link>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Mark Invoice as Paid</h3>
            
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowPayModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

