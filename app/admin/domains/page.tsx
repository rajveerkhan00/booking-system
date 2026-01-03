"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Globe,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    Search,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Database,
    Palette,
    Car,
    Eye,
    EyeOff,
    Loader2,
    ChevronRight,
    Layout,
    ArrowRightLeft
} from "lucide-react"
import Link from "next/link"
import { CurrencyConverter } from "../../components/admin/CurrencyConverter"

interface CarData {
    _id: string
    name: string
    type: string
    price: number
    carType: 'transfer' | 'rental'
}

interface DomainCarConfig {
    carId: string
    price: number
    isVisible: boolean
}

interface DomainData {
    _id?: string
    domainName: string
    themeId?: string
    cars: DomainCarConfig[]
    isActive: boolean
}

interface ThemeData {
    _id: string
    name: string
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

export default function AdminDomainsPage() {
    const [domains, setDomains] = useState<DomainData[]>([])
    const [themes, setThemes] = useState<ThemeData[]>([])
    const [cars, setCars] = useState<CarData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingDomain, setEditingDomain] = useState<DomainData | null>(null)
    const [formData, setFormData] = useState<Partial<DomainData>>({
        domainName: '',
        themeId: '',
        cars: [],
        isActive: true
    })
    const [saving, setSaving] = useState(false)
    const [toasts, setToasts] = useState<Toast[]>([])
    const [activeTab, setActiveTab] = useState<'general' | 'cars'>('general')
    const [showCurrencyConverter, setShowCurrencyConverter] = useState(false)

    // Toast notification system
    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    // Fetch all domains
    const fetchDomains = useCallback(async () => {
        try {
            const response = await fetch('/api/domains')
            const result = await response.json()
            if (result.success) {
                setDomains(result.data)
            }
        } catch (error) {
            showToast('Error fetching domains', 'error')
        }
    }, [showToast])

    // Fetch all themes
    const fetchThemes = useCallback(async () => {
        try {
            const response = await fetch('/api/themes')
            const result = await response.json()
            if (result.success) {
                setThemes(result.data)
            }
        } catch (error) {
            showToast('Error fetching themes', 'error')
        }
    }, [showToast])

    // Fetch all cars
    const fetchCars = useCallback(async () => {
        try {
            const response = await fetch('/api/cars')
            const result = await response.json()
            if (result.success) {
                setCars(result.data)
            }
        } catch (error) {
            showToast('Error fetching cars', 'error')
        }
    }, [showToast])

    const fetchData = useCallback(async () => {
        setLoading(true)
        await Promise.all([fetchDomains(), fetchThemes(), fetchCars()])
        setLoading(false)
    }, [fetchDomains, fetchThemes, fetchCars])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Filter domains by search
    const filteredDomains = domains.filter(domain =>
        domain.domainName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Reset form
    const resetForm = () => {
        setFormData({
            domainName: '',
            themeId: '',
            cars: [],
            isActive: true
        })
        setEditingDomain(null)
        setShowForm(false)
        setActiveTab('general')
    }

    // Open form for adding new
    const handleAddNew = () => {
        // Initialize cars config with default values if needed
        const initialCarConfig = cars.map(car => ({
            carId: car._id,
            price: car.price,
            isVisible: true
        }))
        setFormData({
            domainName: '',
            themeId: '',
            cars: initialCarConfig,
            isActive: true
        })
        setEditingDomain(null)
        setShowForm(true)
        setActiveTab('general')
    }

    // Open form for editing
    const handleEdit = (domain: DomainData) => {
        // Ensure all cars are present in the domain config
        const currentCarConfigs = domain.cars || []
        const mergedCarConfigs = cars.map(car => {
            const existing = currentCarConfigs.find(c => c.carId === car._id)
            if (existing) return existing
            return {
                carId: car._id,
                price: car.price,
                isVisible: true
            }
        })

        setFormData({
            ...domain,
            cars: mergedCarConfigs
        })
        setEditingDomain(domain)
        setShowForm(true)
        setActiveTab('general')
    }

    // Save domain
    const handleSave = async () => {
        if (!formData.domainName) {
            showToast('Domain name is required', 'error')
            return
        }

        setSaving(true)
        try {
            const url = editingDomain ? `/api/domains/${editingDomain._id}` : '/api/domains'
            const method = editingDomain ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()
            if (result.success) {
                showToast(result.message || 'Domain saved successfully', 'success')
                fetchDomains()
                resetForm()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error saving domain', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Delete domain
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this domain?')) return

        try {
            const response = await fetch(`/api/domains/${id}`, { method: 'DELETE' })
            const result = await response.json()
            if (result.success) {
                showToast('Domain deleted successfully', 'success')
                fetchDomains()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error deleting domain', 'error')
        }
    }

    // Update car config in form data
    const updateCarConfig = (carId: string, updates: Partial<DomainCarConfig>) => {
        setFormData(prev => {
            const currentCars = prev.cars || []
            const newCars = currentCars.map(c =>
                c.carId === carId ? { ...c, ...updates } : c
            )
            return { ...prev, cars: newCars }
        })
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Currency Converter Side Panel */}
            <CurrencyConverter
                isOpen={showCurrencyConverter}
                onClose={() => setShowCurrencyConverter(false)}
            />

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-[100] space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-sm border ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30' :
                            toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-red-400/30' :
                                'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-blue-400/30'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        <span className="font-semibold">{toast.message}</span>
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/cars" className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 group shrink-0">
                                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-teal-600" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
                                    <Globe className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Domain Manager</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm">Configure multi-domain settings</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Link
                                href="/admin/themes"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <Palette className="w-4 h-4 text-gray-500" />
                                <span className="hidden sm:inline">Themes</span>
                            </Link>
                            <button
                                onClick={() => setShowCurrencyConverter(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                                <span className="hidden sm:inline">Currency</span>
                            </button>
                            <button
                                onClick={fetchData}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleAddNew}
                                className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Domain</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search domains..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-96 pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                    />
                </div>

                {/* Domains List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                    </div>
                ) : filteredDomains.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <Globe className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">No Domains Found</h3>
                        <p className="text-gray-500">Add your first domain to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDomains.map(domain => (
                            <div key={domain._id} className="bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-teal-50 rounded-2xl text-teal-600">
                                        <Globe className="w-6 h-6" />
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${domain.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {domain.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{domain.domainName}</h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Theme: <span className="font-semibold text-gray-700">
                                        {themes.find(t => t._id === domain.themeId)?.name || 'Default Theme'}
                                    </span>
                                </p>
                                <div className="flex items-center gap-2 mt-6">
                                    <button onClick={() => handleEdit(domain)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-all border border-gray-200">
                                        <Edit3 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(domain._id!)} className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all border border-rose-100">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                    {editingDomain ? <Edit3 className="text-teal-600" /> : <Plus className="text-teal-600" />}
                                    {editingDomain ? 'Edit Domain Configuration' : 'Add New Domain'}
                                </h2>
                                <p className="text-gray-500">Configure theme and car settings for this domain</p>
                            </div>
                            <button onClick={resetForm} className="p-3 hover:bg-white rounded-2xl shadow-sm border border-gray-100 transition-all">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-8 pt-4 bg-gray-50/50">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'general' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4" />
                                    General Settings
                                </div>
                                {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('cars')}
                                className={`px-6 py-3 font-semibold text-sm transition-all relative ${activeTab === 'cars' ? 'text-teal-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Car className="w-4 h-4" />
                                    Car Configuration
                                </div>
                                {activeTab === 'cars' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {activeTab === 'general' ? (
                                <div className="space-y-6 max-w-2xl">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Domain Name</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="e.g. travel.com"
                                                value={formData.domainName}
                                                onChange={e => setFormData({ ...formData, domainName: e.target.value })}
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Assigned Theme</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <select
                                                    value={formData.themeId || ''}
                                                    onChange={e => setFormData({ ...formData, themeId: e.target.value })}
                                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium appearance-none"
                                                >
                                                    <option value="">Default Theme</option>
                                                    {themes.map(theme => (
                                                        <option key={theme._id} value={theme._id}>{theme.name}</option>
                                                    ))}
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-teal-50/50 rounded-3xl border border-teal-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-gray-800">Domain Active</p>
                                            <p className="text-sm text-gray-500">Enable or disable all content for this domain</p>
                                        </div>
                                        <button
                                            onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                            className={`w-14 h-8 rounded-full transition-all duration-300 relative ${formData.isActive ? 'bg-teal-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${formData.isActive ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-bold text-gray-800">Available Cars</h3>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{cars.length} Vehicles Total</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {cars.map(car => {
                                            const config = formData.cars?.find(c => c.carId === car._id) || { carId: car._id, price: car.price, isVisible: true }
                                            return (
                                                <div key={car._id} className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-6 ${config.isVisible ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                                                    <div className={`p-3 rounded-xl ${config.isVisible ? 'bg-teal-50 text-teal-600' : 'bg-gray-200 text-gray-400'}`}>
                                                        <Car className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-800 truncate">{car.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{car.carType} • {car.type}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Price Override</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">$</span>
                                                                <input
                                                                    type="number"
                                                                    value={config.price}
                                                                    onChange={e => updateCarConfig(car._id, { price: parseFloat(e.target.value) || 0 })}
                                                                    className="w-28 pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-bold text-gray-700"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => updateCarConfig(car._id, { isVisible: !config.isVisible })}
                                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border ${config.isVisible ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
                                                        >
                                                            {config.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                            {config.isVisible ? 'Visible' : 'Hidden'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-4 rounded-b-[2.5rem]">
                            <button onClick={resetForm} className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-2xl font-bold transition-all border border-gray-200 shadow-sm">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-10 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
