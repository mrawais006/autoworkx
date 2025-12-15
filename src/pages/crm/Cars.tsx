import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Car, ChevronRight, Building2, User } from 'lucide-react'

export function CarsPage() {
  const [cars, setCars] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        companies:company_id(id, name),
        customers:customer_id(id, full_name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching cars:', error)
    } else {
      setCars(data || [])
    }
    setLoading(false)
  }

  const filteredCars = cars.filter((car) => {
    const searchLower = search.toLowerCase()
    return (
      car.rego_plate.toLowerCase().includes(searchLower) ||
      car.make?.toLowerCase().includes(searchLower) ||
      car.model?.toLowerCase().includes(searchLower) ||
      car.driver_name?.toLowerCase().includes(searchLower) ||
      car.driver_phone?.includes(search) ||
      (car.companies as any)?.name?.toLowerCase().includes(searchLower) ||
      (car.customers as any)?.full_name?.toLowerCase().includes(searchLower)
    )
  })

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
          <h1 className="text-2xl font-bold text-white">Cars</h1>
          <p className="text-slate-400">{cars.length} vehicles registered</p>
        </div>
        <Link
          to="/crm/cars/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Car
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by rego, make, model, driver, company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Cars List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {filteredCars.length === 0 ? (
          <div className="p-12 text-center">
            <Car className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              {search ? 'No cars found' : 'No cars yet'}
            </h3>
            <p className="text-slate-400 mb-4">
              {search ? 'Try a different search term' : 'Add your first vehicle to get started'}
            </p>
            {!search && (
              <Link
                to="/crm/cars/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add Car
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredCars.map((car) => (
              <Link
                key={car.id}
                to={`/crm/cars/${car.id}`}
                className="flex items-center justify-between p-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{car.rego_plate}</span>
                      {car.year && (
                        <span className="text-sm text-slate-500">({car.year})</span>
                      )}
                    </div>
                    <p className="text-slate-400">
                      {car.make} {car.model}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      {(car.companies as any)?.name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {(car.companies as any).name}
                        </span>
                      )}
                      {(car.customers as any)?.full_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {(car.customers as any).full_name}
                        </span>
                      )}
                      {car.driver_name && (
                        <span className="flex items-center gap-1">
                          Driver: {car.driver_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

