"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Car,
    Plus,
    Edit3,
    Trash2,
    Save,
    X,
    Search,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Users,
    Briefcase,
    Star,
    Fuel,
    Settings2,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Database,
    Sparkles,
    Package,
    Route,
    Shield,
    Upload,
    Palette,
    Globe,
    ArrowRightLeft
} from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { CurrencyConverter } from "../../components/admin/CurrencyConverter"
import { ALL_CURRENCIES } from "@/lib/currency"

interface CarData {
    _id?: string
    carType: 'transfer' | 'rental'
    name: string
    type: string
    image: string
    price: number
    currency: string
    description: string
    // Transfer fields
    passengers: number
    mediumLuggage: number
    smallLuggage: number
    rating: number
    cancellationPolicy: string
    // Rental fields
    category: string
    seats: number
    bags: number
    transmission: 'Automatic' | 'Manual'
    pricePerDay: number
    fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid'
    pickupLocation: string
    features: string[]
    isActive: boolean
}

const defaultTransferCar: Partial<CarData> = {
    carType: 'transfer',
    name: '',
    type: 'Standard Service',
    image: '/sedan-transfer.png',
    price: 0,
    currency: 'USD',
    passengers: 3,
    mediumLuggage: 2,
    smallLuggage: 2,
    rating: 5,
    cancellationPolicy: 'Free Cancellation 24h',
    isActive: true
}

const defaultRentalCar: Partial<CarData> = {
    carType: 'rental',
    name: '',
    type: 'Economy',
    category: '',
    image: '/compact-car-city.png',
    price: 0,
    pricePerDay: 0,
    currency: 'USD',
    seats: 5,
    bags: 3,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    pickupLocation: 'Free Shuttle Bus',
    description: 'Free Cancellation',
    features: ['Free Cancellation', 'Damage & theft coverage', 'Full to Full'],
    isActive: true
}

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

export default function AdminCarsPage() {
    const [cars, setCars] = useState<CarData[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'transfer' | 'rental'>('transfer')
    const [searchQuery, setSearchQuery] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editingCar, setEditingCar] = useState<CarData | null>(null)
    const [formData, setFormData] = useState<Partial<CarData>>(defaultTransferCar)
    const [saving, setSaving] = useState(false)
    const [toasts, setToasts] = useState<Toast[]>([])
    const [expandedCard, setExpandedCard] = useState<string | null>(null)
    const [seeding, setSeeding] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [showCurrencyConverter, setShowCurrencyConverter] = useState(false)

    // Toast notification system
    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    // Fetch all cars
    const fetchCars = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/cars')
            const result = await response.json()
            if (result.success) {
                setCars(result.data)
            } else {
                showToast('Failed to fetch cars', 'error')
            }
        } catch (error) {
            showToast('Error connecting to server', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchCars()
    }, [fetchCars])

    // Seed database
    const handleSeed = async () => {
        setSeeding(true)
        try {
            const response = await fetch('/api/cars/seed', { method: 'POST' })
            const result = await response.json()
            if (result.success) {
                showToast(result.message, 'success')
                fetchCars()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error seeding database', 'error')
        } finally {
            setSeeding(false)
        }
    }

    // Filter cars by tab and search
    const filteredCars = cars.filter(car => {
        const matchesTab = car.carType === activeTab
        const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.type.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

    // Reset form
    const resetForm = () => {
        setFormData(activeTab === 'transfer' ? defaultTransferCar : defaultRentalCar)
        setEditingCar(null)
        setImageFile(null)
        setShowForm(false)
    }

    // Open form for adding new car
    const handleAddNew = () => {
        setFormData(activeTab === 'transfer' ? defaultTransferCar : defaultRentalCar)
        setEditingCar(null)
        setImageFile(null)
        setShowForm(true)
    }

    // Open form for editing
    const handleEdit = (car: CarData) => {
        setFormData(car)
        setEditingCar(car)
        setImageFile(null)
        setShowForm(true)
    }

    // Save car (create or update)
    const handleSave = async () => {
        if (!formData.name || !formData.type || formData.price === undefined) {
            showToast('Please fill in all required fields', 'error')
            return
        }

        setSaving(true)
        try {
            const url = editingCar ? `/api/cars/${editingCar._id}` : '/api/cars'
            const method = editingCar ? 'PUT' : 'POST'

            const data = new FormData()

            // Append all fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'features' && Array.isArray(value)) {
                    data.append(key, JSON.stringify(value))
                } else if (key === 'image') {
                    // Skip image string if we have a file, specifically handle it below
                } else if (value !== undefined && value !== null) {
                    data.append(key, value.toString())
                }
            })

            // Handle image
            if (imageFile) {
                data.append('image', imageFile)
            } else if (formData.image) {
                // If no new file, send the existing string URL
                data.append('image', formData.image)
            }

            const response = await fetch(url, {
                method,
                body: data
            })

            const result = await response.json()
            if (result.success) {
                showToast(result.message, 'success')
                fetchCars()
                resetForm()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error saving car', 'error')
        } finally {
            setSaving(false)
        }
    }

    // Delete car
    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this car?')) return

        try {
            const response = await fetch(`/api/cars/${id}`, { method: 'DELETE' })
            const result = await response.json()
            if (result.success) {
                showToast('Car deleted successfully', 'success')
                fetchCars()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error deleting car', 'error')
        }
    }

    // Toggle car active status
    const toggleActive = async (car: CarData) => {
        try {
            const response = await fetch(`/api/cars/${car._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !car.isActive })
            })
            const result = await response.json()
            if (result.success) {
                showToast(`Car ${!car.isActive ? 'activated' : 'deactivated'}`, 'success')
                fetchCars()
            }
        } catch (error) {
            showToast('Error updating car status', 'error')
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Currency Converter Side Panel */}
            <CurrencyConverter
                isOpen={showCurrencyConverter}
                onClose={() => setShowCurrencyConverter(false)}
            />

            {/* Toast Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-sm animate-slide-in-right border ${toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400/30' :
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

            {/* Header - Clean White Style */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 group shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
                                    <Car className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Car Management</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm">Manage vehicles</p>
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
                            <Link
                                href="/admin/domains"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="hidden sm:inline">Domains</span>
                            </Link>
                            <button
                                onClick={() => setShowCurrencyConverter(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                                <span className="hidden sm:inline">Currency</span>
                            </button>
                            <button
                                onClick={fetchCars}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-200 hover:border-gray-300 shadow-sm text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>



                            <button
                                onClick={handleAddNew}
                                className="btn-primary flex items-center gap-2 text-sm px-4 py-2.5"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden xs:inline">Add Car</span>
                            </button>
                            {/* Clerk User Profile Button */}
                            <div className="flex items-center">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-10 h-10 border-2 border-gray-200 hover:border-teal-500 transition-all shadow-sm",
                                            userButtonPopoverCard: "shadow-xl border border-gray-200",
                                            userButtonPopoverActionButton: "hover:bg-gray-100",
                                            userButtonPopoverActionButtonText: "text-gray-700",
                                            userButtonPopoverFooter: "hidden"
                                        }
                                    }}
                                    afterSignOutUrl="/"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards - Premium Glass Style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Car className="w-5 h-5" />}
                        label="Total Cars"
                        value={cars.length}
                        color="teal"
                    />
                    <StatCard
                        icon={<Route className="w-5 h-5" />}
                        label="Transfer Vehicles"
                        value={cars.filter(c => c.carType === 'transfer').length}
                        color="blue"
                    />
                    <StatCard
                        icon={<Sparkles className="w-5 h-5" />}
                        label="Rental Cars"
                        value={cars.filter(c => c.carType === 'rental').length}
                        color="purple"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="Active"
                        value={cars.filter(c => c.isActive).length}
                        color="emerald"
                    />
                </div>

                {/* Tabs & Search - Clean Style */}
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
                    <div className="flex bg-white p-1.5 rounded-2xl border-2 border-gray-100 shadow-sm">
                        <button
                            onClick={() => { setActiveTab('transfer'); resetForm(); }}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'transfer'
                                ? 'bg-gray-100 text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Route className="w-4 h-4" />
                                Transfer Vehicles
                            </span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('rental'); resetForm(); }}
                            className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${activeTab === 'rental'
                                ? 'bg-gray-100 text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Rental Cars
                            </span>
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search cars..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-80 pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Form Modal - Premium Glass Style */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-gray-50 p-6 border-b border-gray-200 flex items-center justify-between rounded-t-3xl">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${editingCar ? 'bg-blue-100' : 'bg-teal-100'}`}>
                                        {editingCar ? <Edit3 className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-teal-600" />}
                                    </div>
                                    {editingCar ? 'Edit Car' : 'Add New Car'}
                                </h2>
                                <button
                                    onClick={resetForm}
                                    className="p-2.5 hover:bg-white/80 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Common Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        label="Name *"
                                        value={formData.name || ''}
                                        onChange={(v) => setFormData(prev => ({ ...prev, name: v }))}
                                        placeholder="e.g., Sedan Car 3pax"
                                    />
                                    <FormField
                                        label="Type *"
                                        value={formData.type || ''}
                                        onChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                                        placeholder="e.g., Standard Service"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        label="Price *"
                                        type="number"
                                        value={formData.price || ''}
                                        onChange={(v) => setFormData(prev => ({ ...prev, price: parseFloat(v) || 0 }))}
                                        placeholder="0.00"
                                    />
                                    <FormSelect
                                        label="Currency"
                                        value={formData.currency || 'USD'}
                                        onChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}
                                        options={ALL_CURRENCIES.map(c => c.code)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Car Image</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                            {imageFile ? (
                                                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                            ) : formData.image ? (
                                                <img src={formData.image} alt="Current" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setImageFile(e.target.files[0])
                                                    }
                                                }}
                                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition-all cursor-pointer"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, up to 5MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Transfer-specific fields */}
                                {activeTab === 'transfer' && (
                                    <>
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                label="Passengers"
                                                type="number"
                                                value={formData.passengers || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, passengers: parseInt(v) || 0 }))}
                                            />
                                            <FormField
                                                label="Medium Luggage"
                                                type="number"
                                                value={formData.mediumLuggage || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, mediumLuggage: parseInt(v) || 0 }))}
                                            />
                                            <FormField
                                                label="Small Luggage"
                                                type="number"
                                                value={formData.smallLuggage || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, smallLuggage: parseInt(v) || 0 }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                label="Rating (0-5)"
                                                type="number"
                                                value={formData.rating || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, rating: Math.min(5, Math.max(0, parseFloat(v) || 0)) }))}
                                            />
                                            <FormField
                                                label="Cancellation Policy"
                                                value={formData.cancellationPolicy || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, cancellationPolicy: v }))}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Rental-specific fields */}
                                {activeTab === 'rental' && (
                                    <>
                                        <FormField
                                            label="Category"
                                            value={formData.category || ''}
                                            onChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                                            placeholder="e.g., Hyundai Avante or similar"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                label="Price Per Day"
                                                type="number"
                                                value={formData.pricePerDay || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, pricePerDay: parseFloat(v) || 0 }))}
                                            />
                                            <FormField
                                                label="Pickup Location"
                                                value={formData.pickupLocation || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, pickupLocation: v }))}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <FormField
                                                label="Seats"
                                                type="number"
                                                value={formData.seats || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, seats: parseInt(v) || 0 }))}
                                            />
                                            <FormField
                                                label="Bags"
                                                type="number"
                                                value={formData.bags || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, bags: parseInt(v) || 0 }))}
                                            />
                                            <FormSelect
                                                label="Transmission"
                                                value={formData.transmission || 'Automatic'}
                                                onChange={(v) => setFormData(prev => ({ ...prev, transmission: v as 'Automatic' | 'Manual' }))}
                                                options={['Automatic', 'Manual']}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormSelect
                                                label="Fuel Type"
                                                value={formData.fuelType || 'Petrol'}
                                                onChange={(v) => setFormData(prev => ({ ...prev, fuelType: v as any }))}
                                                options={['Petrol', 'Diesel', 'Electric', 'Hybrid']}
                                            />
                                            <FormField
                                                label="Description"
                                                value={formData.description || ''}
                                                onChange={(v) => setFormData(prev => ({ ...prev, description: v }))}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-teal-50/30 rounded-2xl border border-gray-200/50">
                                    <div>
                                        <p className="text-gray-800 font-semibold">Active Status</p>
                                        <p className="text-gray-500 text-sm">Car will be shown in booking forms</p>
                                    </div>
                                    <button
                                        onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        className={`relative w-14 h-7 rounded-full transition-all duration-300 shadow-inner ${formData.isActive ? 'bg-primary' : 'bg-gray-200'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.isActive ? 'translate-x-8' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200/50 flex gap-3 justify-end rounded-b-3xl">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all border border-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Car
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cars List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200">
                                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                            </div>
                            <p className="text-gray-600 font-semibold">Loading cars...</p>
                        </div>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-gradient-to-br from-gray-100 to-teal-50 rounded-3xl border border-gray-200/50 mb-6 shadow-sm">
                            <Car className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Cars Found</h3>
                        <p className="text-gray-500 mb-6 max-w-md">
                            {cars.length === 0
                                ? "Your database is empty. Click 'Seed Database' to add initial cars or add them manually."
                                : "No cars match your search criteria."
                            }
                        </p>
                        {cars.length === 0 && (
                            <button
                                onClick={handleSeed}
                                disabled={seeding}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all"
                            >
                                <Database className="w-5 h-5" />
                                Seed Database with Sample Cars
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCars.map((car) => (
                            <CarCard
                                key={car._id}
                                car={car}
                                isExpanded={expandedCard === car._id}
                                onToggleExpand={() => setExpandedCard(expandedCard === car._id ? null : car._id!)}
                                onEdit={() => handleEdit(car)}
                                onDelete={() => handleDelete(car._id!)}
                                onToggleActive={() => toggleActive(car)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div >
    )
}

// Stat Card Component - Premium Glass Style
function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    const colors: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
        teal: {
            gradient: 'from-gray-600 to-gray-700',
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200'
        },
        blue: {
            gradient: 'from-gray-600 to-gray-700',
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200'
        },
        purple: {
            gradient: 'from-gray-600 to-gray-700',
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200'
        },
        emerald: {
            gradient: 'from-gray-600 to-gray-700',
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200'
        }
    }

    const c = colors[color]

    return (
        <div className={`${c.bg} border-2 ${c.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div className={`p-3 bg-gradient-to-br ${c.gradient} rounded-xl shadow-sm text-white`}>
                {icon}
            </div>
            <div>
                <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
            </div>
        </div>
    )
}

// Form Field Component - Premium Style
function FormField({ label, value, onChange, type = 'text', placeholder = '' }: {
    label: string
    value: string | number
    onChange: (value: string) => void
    type?: string
    placeholder?: string
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
        </div>
    )
}

// Form Select Component - Premium Style
function FormSelect({ label, value, onChange, options }: {
    label: string
    value: string
    onChange: (value: string) => void
    options: string[]
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px'
                }}
            >
                {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    )
}

// Car Card Component - Premium Glass Style
function CarCard({ car, isExpanded, onToggleExpand, onEdit, onDelete, onToggleActive }: {
    car: CarData
    isExpanded: boolean
    onToggleExpand: () => void
    onEdit: () => void
    onDelete: () => void
    onToggleActive: () => void
}) {
    const isTransfer = car.carType === 'transfer'

    return (
        <div className={`bg-white border-2 rounded-2xl overflow-hidden transition-all duration-300 ${car.isActive ? 'border-gray-100 shadow-sm hover:shadow-medium hover:border-gray-200' : 'border-amber-200 bg-amber-50/20 shadow-sm opacity-80'
            }`}>
            <div className="p-5 flex items-center gap-5">
                {/* Image */}
                <div className="w-36 h-24 bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                    <img
                        src={car.image || '/placeholder-car.png'}
                        alt={car.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/compact-car-city.png' }}
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg truncate">{car.name}</h3>
                        <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${isTransfer
                            ? 'bg-gray-100 text-gray-700 border border-gray-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                            {car.type}
                        </span>
                        {!car.isActive && (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold border border-amber-200">
                                Inactive
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        {isTransfer ? (
                            <>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Users className="w-4 h-4 text-teal-500" /> {car.passengers} pax
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Briefcase className="w-4 h-4 text-blue-500" /> {car.mediumLuggage + car.smallLuggage} bags
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {car.rating}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Users className="w-4 h-4 text-teal-500" /> {car.seats} seats
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Briefcase className="w-4 h-4 text-blue-500" /> {car.bags} bags
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Settings2 className="w-4 h-4 text-purple-500" /> {car.transmission}
                                </span>
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Fuel className="w-4 h-4 text-orange-500" /> {car.fuelType}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="text-right px-4">
                    <p className="text-2xl font-bold text-gray-900">
                        {car.currency} {car.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {!isTransfer && car.pricePerDay && (
                        <p className="text-gray-500 text-sm font-medium">
                            {car.currency} {car.pricePerDay.toLocaleString('en-US', { minimumFractionDigits: 2 })}/day
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleActive}
                        className={`p-2.5 rounded-xl transition-all duration-300 ${car.isActive
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'
                            }`}
                        title={car.isActive ? 'Deactivate' : 'Activate'}
                    >
                        <CheckCircle className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onEdit}
                        className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 border border-blue-200"
                        title="Edit"
                    >
                        <Edit3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 border border-red-200"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={onToggleExpand}
                        className="p-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-300 border border-gray-200"
                        title="Expand"
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100 mt-2">
                    <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {isTransfer ? (
                            <>
                                <DetailItem label="Passengers" value={car.passengers} />
                                <DetailItem label="Medium Luggage" value={car.mediumLuggage} />
                                <DetailItem label="Small Luggage" value={car.smallLuggage} />
                                <DetailItem label="Rating" value={`${car.rating}/5`} />
                                <DetailItem label="Cancellation" value={car.cancellationPolicy} />
                            </>
                        ) : (
                            <>
                                <DetailItem label="Category" value={car.category || '-'} />
                                <DetailItem label="Seats" value={car.seats} />
                                <DetailItem label="Bags" value={car.bags} />
                                <DetailItem label="Transmission" value={car.transmission} />
                                <DetailItem label="Fuel Type" value={car.fuelType} />
                                <DetailItem label="Pickup" value={car.pickupLocation || '-'} />
                                <DetailItem label="Description" value={car.description || '-'} />
                                <DetailItem label="Features" value={(car.features || []).join(', ') || '-'} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">{label}</p>
            <p className="text-gray-800 font-semibold">{value}</p>
        </div>
    )
}
