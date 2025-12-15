import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { 
  DollarSign, 
  Car, 
  Wrench, 
  Receipt,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight
} from 'lucide-react'

interface RevenueStats {
  today_revenue: number
  week_revenue: number
  month_revenue: number
  all_time_revenue: number
}

interface UpcomingService {
  visit_id: string
  car_id: string
  rego_plate: string
  make: string
  model: string
  next_service_due_date: string
  days_until_due: number
  customer_name: string
  company_name: string
}

interface UnpaidInvoice {
  invoice_id: string
  invoice_number: string
  total: number
  visit_date: string
  rego_plate: string
  customer_name: string
  company_name: string
  days_overdue: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [upcomingServices, setUpcomingServices] = useState<UpcomingService[]>([])
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch revenue stats
      const { data: revenueData } = await supabase.rpc('get_revenue_stats')
      if (revenueData && revenueData.length > 0) {
        setStats(revenueData[0])
      }

      // Fetch upcoming services
      const { data: servicesData } = await supabase.rpc('get_upcoming_services', { p_days: 14 })
      if (servicesData) {
        setUpcomingServices(servicesData)
      }

      // Fetch unpaid invoices
      const { data: invoicesData } = await supabase.rpc('get_unpaid_invoices')
      if (invoicesData) {
        setUnpaidInvoices(invoicesData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back! Here's your overview.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/crm/cars/new"
          className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group"
        >
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30">
            <Plus className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-white">Add New Car</p>
            <p className="text-sm text-slate-400">Register a vehicle</p>
          </div>
        </Link>

        <Link
          to="/crm/service/new"
          className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-green-500 transition-colors group"
        >
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30">
            <Wrench className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="font-medium text-white">Add Service</p>
            <p className="text-sm text-slate-400">Create service visit</p>
          </div>
        </Link>

        <Link
          to="/crm/payments"
          className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-purple-500 transition-colors group"
        >
          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30">
            <Receipt className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-white">Record Payment</p>
            <p className="text-sm text-slate-400">Mark invoice paid</p>
          </div>
        </Link>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm text-slate-400">Today</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.today_revenue || 0)}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-slate-400">This Week</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.week_revenue || 0)}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-slate-400">This Month</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.month_revenue || 0)}</p>
        </div>

        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-slate-400">All Time</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.all_time_revenue || 0)}</p>
        </div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Services */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Upcoming Services</h2>
            </div>
            <span className="text-sm text-slate-400">Next 14 days</span>
          </div>
          <div className="divide-y divide-slate-700">
            {upcomingServices.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming services</p>
              </div>
            ) : (
              upcomingServices.slice(0, 5).map((service) => (
                <Link
                  key={service.visit_id}
                  to={`/crm/cars/${service.car_id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{service.rego_plate}</p>
                    <p className="text-sm text-slate-400">
                      {service.make} {service.model}
                      {service.customer_name && ` • ${service.customer_name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      service.days_until_due <= 3 ? 'text-red-400' : 
                      service.days_until_due <= 7 ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {service.days_until_due === 0 ? 'Today' : 
                       service.days_until_due === 1 ? 'Tomorrow' :
                       `${service.days_until_due} days`}
                    </p>
                    <p className="text-xs text-slate-500">{service.next_service_due_date}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
          {upcomingServices.length > 5 && (
            <Link
              to="/crm/cars"
              className="flex items-center justify-center gap-2 p-3 border-t border-slate-700 text-sm text-blue-400 hover:text-blue-300"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Unpaid Invoices */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <h2 className="font-semibold text-white">Unpaid Invoices</h2>
            </div>
            <span className="text-sm text-slate-400">{unpaidInvoices.length} pending</span>
          </div>
          <div className="divide-y divide-slate-700">
            {unpaidInvoices.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>All invoices paid!</p>
              </div>
            ) : (
              unpaidInvoices.slice(0, 5).map((invoice) => (
                <Link
                  key={invoice.invoice_id}
                  to={`/crm/payments?invoice=${invoice.invoice_id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white">{invoice.invoice_number}</p>
                    <p className="text-sm text-slate-400">
                      {invoice.rego_plate}
                      {invoice.customer_name && ` • ${invoice.customer_name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(invoice.total)}</p>
                    <p className={`text-xs ${
                      invoice.days_overdue > 14 ? 'text-red-400' : 
                      invoice.days_overdue > 7 ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                      {invoice.days_overdue > 0 ? `${invoice.days_overdue} days ago` : 'Today'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
          {unpaidInvoices.length > 5 && (
            <Link
              to="/crm/payments"
              className="flex items-center justify-center gap-2 p-3 border-t border-slate-700 text-sm text-blue-400 hover:text-blue-300"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

