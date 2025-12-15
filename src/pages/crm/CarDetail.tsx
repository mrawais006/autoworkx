import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { CarWithRelations, ServiceVisit, Invoice } from '../../lib/database.types'
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  Car, 
  Building2, 
  User, 
  Phone, 
  Wrench,
  Calendar,
  Gauge,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ServiceWithInvoice extends ServiceVisit {
  invoices: Invoice[]
}

export function CarDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState<CarWithRelations | null>(null)
  const [services, setServices] = useState<ServiceWithInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (id) {
      fetchCarDetails()
    }
  }, [id])

  const fetchCarDetails = async () => {
    if (!id) return
    
    const [carRes, servicesRes] = await Promise.all([
      supabase
        .from('cars')
        .select(`
          *,
          companies:company_id(*),
          customers:customer_id(*)
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('service_visits')
        .select(`
          *,
          invoices(*)
        `)
        .eq('car_id', id)
        .order('visit_date', { ascending: false })
    ])

    if (carRes.error || !carRes.data) {
      toast.error('Car not found')
      navigate('/crm/cars')
      return
    }

    setCar(carRes.data)
    setServices(servicesRes.data || [])
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!id) return
    if (!confirm('Are you sure you want to delete this car? This will also delete all service history.')) {
      return
    }

    setDeleting(true)
    const { error } = await supabase.from('cars').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete car')
      setDeleting(false)
    } else {
      toast.success('Car deleted')
      navigate('/crm/cars')
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

  if (!car) return null

  const company = car.companies as any
  const customer = car.customers as any

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/crm/cars"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{car.rego_plate}</h1>
              {car.year && <span className="text-slate-400">({car.year})</span>}
            </div>
            <p className="text-slate-400">{car.make} {car.model}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/crm/cars/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Car Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Vehicle Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Rego Plate</p>
                <p className="text-white font-medium">{car.rego_plate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Make & Model</p>
                <p className="text-white font-medium">{car.make || '-'} {car.model || ''}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Year</p>
                <p className="text-white font-medium">{car.year || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">VIN</p>
                <p className="text-white font-medium">{car.vin || '-'}</p>
              </div>
            </div>

            {car.notes && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-sm text-slate-400">Notes</p>
                <p className="text-white mt-1">{car.notes}</p>
              </div>
            )}
          </div>

          {/* Service History */}
          <div className="bg-slate-800 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Service History</h2>
              <Link
                to={`/crm/service/new?car=${id}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </Link>
            </div>

            {services.length === 0 ? (
              <div className="p-8 text-center">
                <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-400">No service history yet</p>
                <Link
                  to={`/crm/service/new?car=${id}`}
                  className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300"
                >
                  <Plus className="w-4 h-4" />
                  Add first service
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {services.map((service) => {
                  const invoice = service.invoices?.[0]
                  return (
                    <Link
                      key={service.id}
                      to={`/crm/service/${service.id}`}
                      className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-white">
                              {format(new Date(service.visit_date), 'dd MMM yyyy')}
                            </span>
                            {invoice && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                invoice.status === 'Paid' ? 'bg-green-500/20 text-green-400' :
                                invoice.status === 'Overdue' ? 'bg-red-500/20 text-red-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {invoice.status}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            {service.odometer_km && (
                              <span className="flex items-center gap-1">
                                <Gauge className="w-3 h-3" />
                                {service.odometer_km.toLocaleString()} km
                              </span>
                            )}
                            {service.next_service_due_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Next: {format(new Date(service.next_service_due_date), 'dd MMM yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {invoice && (
                        <div className="text-right">
                          <p className="font-medium text-white">{formatCurrency(invoice.total)}</p>
                          <p className="text-sm text-slate-400">{invoice.invoice_number}</p>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company */}
          {company && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Company</p>
                  <p className="font-medium text-white">{company.name}</p>
                </div>
              </div>
              {company.primary_phone && (
                <a href={`tel:${company.primary_phone}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                  {company.primary_phone}
                </a>
              )}
            </div>
          )}

          {/* Customer */}
          {customer && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Customer</p>
                  <p className="font-medium text-white">{customer.full_name}</p>
                </div>
              </div>
              {customer.phone && (
                <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                  {customer.phone}
                </a>
              )}
            </div>
          )}

          {/* Driver */}
          {(car.driver_name || car.driver_phone) && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Driver</p>
                  <p className="font-medium text-white">{car.driver_name || 'Unknown'}</p>
                </div>
              </div>
              {car.driver_phone && (
                <a href={`tel:${car.driver_phone}`} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                  <Phone className="w-4 h-4" />
                  {car.driver_phone}
                </a>
              )}
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Services</span>
                <span className="text-white font-medium">{services.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Spent</span>
                <span className="text-white font-medium">
                  {formatCurrency(
                    services.reduce((sum, s) => sum + (s.invoices?.[0]?.total || 0), 0)
                  )}
                </span>
              </div>
              {services[0]?.odometer_km && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Last Odometer</span>
                  <span className="text-white font-medium">{services[0].odometer_km.toLocaleString()} km</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

