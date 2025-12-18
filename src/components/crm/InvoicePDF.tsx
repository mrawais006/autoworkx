import { forwardRef } from 'react'
import { format } from 'date-fns'

interface LineItemData {
  name: string
  qty: number
  unit_price: number
  tax_flag: boolean
  line_total?: number
}

interface InvoiceData {
  invoice_number: string | null
  created_at: string | null
  subtotal: number
  tax_rate: number
  tax_total: number
  total: number
  status: string
  notes?: string | null
  paid_date?: string | null
  payment_method?: string | null
}

interface CompanyData {
  name: string
  primary_email?: string | null
  primary_phone?: string | null
  billing_address?: string | null
}

interface CustomerData {
  full_name: string
  email?: string | null
  phone?: string | null
}

interface CarData {
  rego_plate: string
  make?: string | null
  model?: string | null
  year?: number | null
}

interface SettingsData {
  shop_name: string
  shop_phone?: string | null
  shop_email?: string | null
  shop_address?: string | null
  shop_abn?: string | null
}

export interface InvoicePDFProps {
  invoice: InvoiceData
  company?: CompanyData | null
  customer?: CustomerData | null
  car?: CarData | null
  lineItems: LineItemData[]
  settings: SettingsData
  terms?: string
}

export const InvoicePDF = forwardRef<HTMLDivElement, InvoicePDFProps>(
  ({ invoice, company, customer, car, lineItems, settings, terms }, ref) => {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-AU', { 
        style: 'currency', 
        currency: 'AUD',
        minimumFractionDigits: 2 
      }).format(amount)

    const invoiceDate = invoice.created_at 
      ? format(new Date(invoice.created_at), 'dd/MM/yyyy')
      : format(new Date(), 'dd/MM/yyyy')

    return (
      <div 
        ref={ref} 
        className="bg-white text-gray-900 p-8 max-w-[800px] mx-auto print:p-6" 
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      >
        {/* Header with Logo */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex-1">
            <img 
              src="/Autoworx.webp" 
              alt="AutoWorkX & Tyres" 
              className="h-20 mb-3 object-contain"
              crossOrigin="anonymous"
            />
            <div className="text-sm text-gray-600 space-y-0.5">
              {settings.shop_address && <p>{settings.shop_address}</p>}
              {settings.shop_phone && <p>Phone: {settings.shop_phone}</p>}
              {settings.shop_email && <p>Email: {settings.shop_email}</p>}
              {settings.shop_abn && <p className="font-medium">ABN: {settings.shop_abn}</p>}
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">TAX INVOICE</h1>
            <p className="text-xl font-bold text-blue-600 mb-3">
              {invoice.invoice_number || 'DRAFT'}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="text-gray-500">Date:</span> {invoiceDate}</p>
              {invoice.paid_date && (
                <p><span className="text-gray-500">Paid:</span> {format(new Date(invoice.paid_date), 'dd/MM/yyyy')}</p>
              )}
            </div>
            <div className="mt-3">
              <span className={`inline-block px-4 py-1.5 text-sm font-semibold rounded-full ${
                invoice.status === 'Paid' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : invoice.status === 'Overdue' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : invoice.status === 'Sent'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To / Vehicle Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
            <p className="font-bold text-lg text-gray-900">
              {company?.name || customer?.full_name || 'Customer'}
            </p>
            {company && customer && (
              <p className="text-gray-700 mt-1">Attn: {customer.full_name}</p>
            )}
            <div className="text-sm text-gray-600 mt-2 space-y-0.5">
              {(company?.primary_email || customer?.email) && (
                <p>{company?.primary_email || customer?.email}</p>
              )}
              {(company?.primary_phone || customer?.phone) && (
                <p>{company?.primary_phone || customer?.phone}</p>
              )}
              {company?.billing_address && (
                <p className="whitespace-pre-line">{company.billing_address}</p>
              )}
            </div>
          </div>

          {car && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vehicle Details</h3>
              <p className="font-bold text-lg text-gray-900">{car.rego_plate}</p>
              <p className="text-gray-600 mt-1">
                {[car.make, car.model, car.year ? `(${car.year})` : ''].filter(Boolean).join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mb-8">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left py-3 px-4 font-semibold text-sm rounded-tl-lg">Description</th>
                <th className="text-center py-3 px-4 font-semibold text-sm w-20">Qty</th>
                <th className="text-right py-3 px-4 font-semibold text-sm w-28">Unit Price</th>
                <th className="text-center py-3 px-4 font-semibold text-sm w-16">GST</th>
                <th className="text-right py-3 px-4 font-semibold text-sm w-28 rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => {
                const lineTotal = item.line_total ?? item.qty * item.unit_price
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{item.qty}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 px-4 text-center text-gray-500 text-sm">
                      {item.tax_flag ? '✓' : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(lineTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-72 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between py-2 text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between py-2 text-gray-600">
              <span>GST ({invoice.tax_rate}%)</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.tax_total)}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-900">
              <span className="text-lg font-bold text-gray-900">TOTAL AUD</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
            </div>
            {invoice.status === 'Paid' && invoice.payment_method && (
              <div className="flex justify-between py-2 text-sm text-green-600 mt-2">
                <span>Paid via</span>
                <span className="font-medium">{invoice.payment_method}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">Notes</h3>
            <p className="text-sm text-blue-900 whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}

        {/* Terms & Conditions */}
        {terms && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Terms & Conditions
            </h3>
            <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">{terms}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Payment Information
          </h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p><span className="text-gray-500">Bank:</span> Contact us for bank details</p>
            <p><span className="text-gray-500">Reference:</span> {invoice.invoice_number || 'Invoice Number'}</p>
            <p className="text-xs text-gray-500 mt-2">Payment is due within 14 days of invoice date.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-gray-200">
          <p className="text-lg font-semibold text-gray-800 mb-2">Thank you for your business!</p>
          <p className="text-sm text-gray-500">
            We appreciate your trust in AutoWorkX & Tyres
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {settings.shop_name} • {settings.shop_phone} • {settings.shop_email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              www.autoworkx.com.au
            </p>
          </div>
        </div>
      </div>
    )
  }
)

InvoicePDF.displayName = 'InvoicePDF'

