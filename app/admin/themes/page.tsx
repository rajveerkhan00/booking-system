"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Palette,
    X,
    Search,
    RefreshCw,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    Sparkles,
    Loader2,
    Eye,
    Paintbrush,
    Check,
    Globe,
    ArrowRightLeft
} from "lucide-react"
import Link from "next/link"
import { CurrencyConverter } from "../../components/admin/CurrencyConverter"
import { useTheme, ThemeData } from "@/app/context/ThemeContext"

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: number
    message: string
    type: ToastType
}

export default function AdminThemesPage() {
    const [themes, setThemes] = useState<ThemeData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [toasts, setToasts] = useState<Toast[]>([])
    const [activatingId, setActivatingId] = useState<string | null>(null)
    const [previewTheme, setPreviewTheme] = useState<ThemeData | null>(null)
    const [showCurrencyConverter, setShowCurrencyConverter] = useState(false)

    const { refreshTheme } = useTheme()

    // Toast notification system
    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 4000)
    }, [])

    // Fetch all themes
    const fetchThemes = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/themes')
            const result = await response.json()
            if (result.success) {
                setThemes(result.data)
            } else {
                showToast('Failed to fetch themes', 'error')
            }
        } catch (error) {
            showToast('Error connecting to server', 'error')
        } finally {
            setLoading(false)
        }
    }, [showToast])

    useEffect(() => {
        fetchThemes()
    }, [fetchThemes])

    // Filter themes by search
    const filteredThemes = themes.filter(theme => {
        return theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            theme.description.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Activate theme
    const handleActivate = async (theme: ThemeData) => {
        if (theme.isActive) return

        setActivatingId(theme._id)
        try {
            const response = await fetch(`/api/themes/${theme._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true })
            })
            const result = await response.json()
            if (result.success) {
                showToast(`Theme "${theme.name}" activated!`, 'success')
                fetchThemes()
                refreshTheme()
            } else {
                showToast(result.message, 'error')
            }
        } catch (error) {
            showToast('Error activating theme', 'error')
        } finally {
            setActivatingId(null)
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

            {/* Theme Preview Modal */}
            {previewTheme && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div
                            className="p-6 text-white"
                            style={{ background: `linear-gradient(135deg, ${previewTheme.backgroundStart}, ${previewTheme.backgroundMiddle}, ${previewTheme.backgroundEnd})` }}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">{previewTheme.name}</h2>
                                    <p className="text-white/80">{previewTheme.description}</p>
                                </div>
                                <button
                                    onClick={() => setPreviewTheme(null)}
                                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Primary Colors</h3>
                                    <div className="flex gap-2">
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.primaryColor }}
                                            title="Primary"
                                        />
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.primaryDark }}
                                            title="Primary Dark"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Secondary Colors</h3>
                                    <div className="flex gap-2">
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.secondaryColor }}
                                            title="Secondary"
                                        />
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.secondaryDark }}
                                            title="Secondary Dark"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Background Gradient</h3>
                                    <div
                                        className="h-12 rounded-xl shadow-md"
                                        style={{ background: `linear-gradient(135deg, ${previewTheme.backgroundStart}, ${previewTheme.backgroundMiddle}, ${previewTheme.backgroundEnd})` }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">Accent Colors</h3>
                                    <div className="flex gap-2">
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.accentColor }}
                                            title="Accent"
                                        />
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.successColor }}
                                            title="Success"
                                        />
                                        <div
                                            className="w-12 h-12 rounded-xl shadow-md"
                                            style={{ backgroundColor: previewTheme.warningColor }}
                                            title="Warning"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setPreviewTheme(null)}
                                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    Close
                                </button>
                                {!previewTheme.isActive && (
                                    <button
                                        onClick={() => {
                                            handleActivate(previewTheme)
                                            setPreviewTheme(null)
                                        }}
                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl"
                                    >
                                        Activate This Theme
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/cars"
                                className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 group shrink-0"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-100 rounded-2xl border border-gray-200 shrink-0">
                                    <Palette className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Theme Manager</h1>
                                    <p className="text-gray-500 text-xs sm:text-sm">Select from 30+ beautiful themes</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                                onClick={fetchThemes}
                                disabled={loading}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-200 hover:border-gray-300 shadow-sm text-sm"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => setShowCurrencyConverter(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                                <span className="hidden sm:inline">Currency</span>
                            </button>
                            <Link
                                href="/admin/domains"
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-100 shadow-sm text-sm"
                            >
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="hidden sm:inline">Domains</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={<Palette className="w-5 h-5" />}
                        label="Total Themes"
                        value={themes.length}
                        color="purple"
                    />
                    <StatCard
                        icon={<CheckCircle className="w-5 h-5" />}
                        label="Active Theme"
                        value={themes.find(t => t.isActive)?.name || 'None'}
                        isText
                        color="emerald"
                    />
                    <StatCard
                        icon={<Paintbrush className="w-5 h-5" />}
                        label="Light Themes"
                        value={themes.filter(t => !t.name.toLowerCase().includes('dark')).length}
                        color="blue"
                    />
                    <StatCard
                        icon={<Sparkles className="w-5 h-5" />}
                        label="Dark Themes"
                        value={themes.filter(t => t.name.toLowerCase().includes('dark') || t.name.toLowerCase().includes('midnight')).length}
                        color="slate"
                    />
                </div>

                {/* Search */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search themes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-80 pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                    <p className="text-gray-500">
                        Showing <span className="font-semibold text-gray-700">{filteredThemes.length}</span> themes
                    </p>
                </div>

                {/* Themes Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-gray-100 rounded-2xl border border-gray-200">
                                <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
                            </div>
                            <p className="text-gray-600 font-semibold">Loading themes...</p>
                        </div>
                    </div>
                ) : filteredThemes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-6 bg-gradient-to-br from-gray-100 to-purple-50 rounded-3xl border border-gray-200/50 mb-6 shadow-sm">
                            <Palette className="w-16 h-16 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Themes Found</h3>
                        <p className="text-gray-500 mb-6 max-w-md">No themes match your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredThemes.map((theme) => (
                            <ThemeCard
                                key={theme._id}
                                theme={theme}
                                isActivating={activatingId === theme._id}
                                onPreview={() => setPreviewTheme(theme)}
                                onActivate={() => handleActivate(theme)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

// Stat Card Component
function StatCard({ icon, label, value, color, isText = false }: {
    icon: React.ReactNode
    label: string
    value: number | string
    color: string
    isText?: boolean
}) {
    const colors: Record<string, { gradient: string; bg: string; text: string; border: string }> = {
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
        },
        blue: {
            gradient: 'from-gray-600 to-gray-700',
            bg: 'bg-white',
            text: 'text-gray-900',
            border: 'border-gray-200'
        },
        slate: {
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
                <p className={`${isText ? 'text-lg' : 'text-3xl'} font-bold ${c.text} truncate max-w-[120px]`}>{value}</p>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
            </div>
        </div>
    )
}

// Theme Card Component
function ThemeCard({ theme, isActivating, onPreview, onActivate }: {
    theme: ThemeData
    isActivating: boolean
    onPreview: () => void
    onActivate: () => void
}) {
    return (
        <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${theme.isActive ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-gray-200 hover:border-purple-200'}`}>
            {/* Theme Preview Header */}
            <div
                className="h-24 relative"
                style={{ background: `linear-gradient(135deg, ${theme.backgroundStart}, ${theme.backgroundMiddle}, ${theme.backgroundEnd})` }}
            >
                {theme.isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/95 rounded-full shadow-lg">
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-emerald-600">Active</span>
                    </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <div
                        className="w-8 h-8 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div
                        className="w-8 h-8 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: theme.secondaryColor }}
                    />
                    <div
                        className="w-8 h-8 rounded-lg shadow-md border-2 border-white"
                        style={{ backgroundColor: theme.accentColor }}
                    />
                </div>
            </div>

            {/* Theme Info */}
            <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{theme.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{theme.description}</p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPreview}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-all"
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </button>
                    {!theme.isActive && (
                        <button
                            onClick={onActivate}
                            disabled={isActivating}
                            className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm"
                            title="Activate"
                        >
                            {isActivating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            Activate
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
