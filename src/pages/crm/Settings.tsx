import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Settings } from '../../lib/database.types'
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    shop_name: '',
    shop_phone: '',
    shop_email: '',
    shop_address: '',
    shop_abn: '',
    default_reminder_weeks: 8,
    default_tax_rate: 10,
    email_template_service: '',
    email_template_invoice: '',
    sms_template_service: '',
    sms_template_invoice: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (data) {
      setSettings(data)
      setFormData({
        shop_name: data.shop_name || '',
        shop_phone: data.shop_phone || '',
        shop_email: data.shop_email || '',
        shop_address: data.shop_address || '',
        shop_abn: data.shop_abn || '',
        default_reminder_weeks: data.default_reminder_weeks || 8,
        default_tax_rate: data.default_tax_rate || 10,
        email_template_service: data.email_template_service || '',
        email_template_invoice: data.email_template_invoice || '',
        sms_template_service: data.sms_template_service || '',
        sms_template_invoice: data.sms_template_invoice || '',
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    setSaving(true)

    const { error } = await supabase
      .from('settings')
      .update({
        shop_name: formData.shop_name,
        shop_phone: formData.shop_phone || null,
        shop_email: formData.shop_email || null,
        shop_address: formData.shop_address || null,
        shop_abn: formData.shop_abn || null,
        default_reminder_weeks: formData.default_reminder_weeks,
        default_tax_rate: formData.default_tax_rate,
        email_template_service: formData.email_template_service || null,
        email_template_invoice: formData.email_template_invoice || null,
        sms_template_service: formData.sms_template_service || null,
        sms_template_invoice: formData.sms_template_invoice || null,
      })
      .eq('id', settings.id)

    if (error) {
      toast.error('Failed to save settings')
    } else {
      toast.success('Settings saved successfully')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Configure your shop details and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shop Details */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Shop Details</h2>
              <p className="text-sm text-slate-400">Used on invoices and communications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Shop Name</label>
              <input
                type="text"
                value={formData.shop_name}
                onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.shop_phone}
                onChange={(e) => setFormData({ ...formData, shop_phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.shop_email}
                onChange={(e) => setFormData({ ...formData, shop_email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">ABN</label>
              <input
                type="text"
                value={formData.shop_abn}
                onChange={(e) => setFormData({ ...formData, shop_abn: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="XX XXX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.default_tax_rate}
                onChange={(e) => setFormData({ ...formData, default_tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
              <textarea
                rows={2}
                value={formData.shop_address}
                onChange={(e) => setFormData({ ...formData, shop_address: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Service Reminder Settings */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Service Reminders</h2>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Default Reminder Period</label>
            <select
              value={formData.default_reminder_weeks}
              onChange={(e) => setFormData({ ...formData, default_reminder_weeks: parseInt(e.target.value) })}
              className="w-full md:w-48 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2">2 weeks</option>
              <option value="4">4 weeks</option>
              <option value="6">6 weeks</option>
              <option value="8">8 weeks</option>
              <option value="12">12 weeks</option>
            </select>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Email Templates</h2>
          <p className="text-sm text-slate-400 mb-4">
            Available variables: {'{{customer_name}}'}, {'{{rego_plate}}'}, {'{{due_date}}'}, {'{{invoice_number}}'}, {'{{total}}'}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Service Reminder</label>
              <textarea
                rows={3}
                value={formData.email_template_service}
                onChange={(e) => setFormData({ ...formData, email_template_service: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invoice Reminder</label>
              <textarea
                rows={3}
                value={formData.email_template_invoice}
                onChange={(e) => setFormData({ ...formData, email_template_invoice: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* SMS Templates */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">SMS Templates</h2>
          <p className="text-sm text-slate-400 mb-4">Keep SMS short - under 160 characters</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Service Reminder</label>
              <textarea
                rows={2}
                value={formData.sms_template_service}
                onChange={(e) => setFormData({ ...formData, sms_template_service: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.sms_template_service.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Invoice Reminder</label>
              <textarea
                rows={2}
                value={formData.sms_template_invoice}
                onChange={(e) => setFormData({ ...formData, sms_template_invoice: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.sms_template_invoice.length}/160 characters
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}

