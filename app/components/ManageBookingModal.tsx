"use client"

import { useState, useEffect } from 'react'
import {
    Search,
    Calendar,
    Clock,
    MapPin,
    Car,
    User,
    Mail,
    Phone,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    ShieldCheck,
    Coins
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ManageBookingModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ManageBookingModal({ isOpen, onClose }: ManageBookingModalProps) {
    const [reference, setReference] = useState('')
    const [loading, setLoading] = useState(false)
    const [booking, setBooking] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [cancelling, setCancelling] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const { theme } = useTheme()

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setReference('')
            setBooking(null)
            setError(null)
            setSuccessMessage(null)
        }
    }, [isOpen])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reference) return

        setLoading(true)
        setError(null)
        setBooking(null)
        setSuccessMessage(null)

        try {
            const res = await fetch(`/api/bookings/${reference}`)
            const data = await res.json()

            if (data.success) {
                setBooking(data.booking)
            } else {
                setError(data.message || 'Booking not found. Please check your reference number.')
            }
        } catch (err) {
            setError('An error occurred while fetching the booking.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async () => {
        if (!booking || !confirm('Are you sure you want to cancel this booking?')) return

        setCancelling(true)
        setError(null)

        try {
            const res = await fetch(`/api/bookings/${booking.bookingReference}`, {
                method: 'PATCH'
            })
            const data = await res.json()

            if (data.success) {
                setSuccessMessage('Your booking has been cancelled successfully. A confirmation email has been sent.')
                setBooking({ ...booking, status: 'cancelled' })
            } else {
                setError(data.message || 'Failed to cancel the booking.')
            }
        } catch (err) {
            setError('An error occurred while cancelling the booking.')
        } finally {
            setCancelling(false)
        }
    }

    const isWithin24Hours = (createdAt: string) => {
        const created = new Date(createdAt).getTime()
        const now = new Date().getTime()
        const hours = (now - created) / (1000 * 60 * 60)
        return hours <= 24
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#F8FAFC] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-scale-in">
                {/* Modal Header */}
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl" style={{ backgroundColor: theme ? `${theme.primaryColor}1a` : 'rgba(20, 184, 166, 0.1)' }}>
                            <ShieldCheck className="w-6 h-6" style={{ color: theme?.primaryColor || '#14b8a6' }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Manage Booking</h2>
                            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: theme?.textMuted || '#94a3b8' }}>Reference Check</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-gray-100 rounded-2xl transition-all group"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {!booking ? (
                        <div className="text-center py-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Find Your Trip</h3>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Enter your booking reference number provided in your confirmation email.</p>

                            <form onSubmit={handleSearch} className="max-w-md mx-auto">
                                <div className="relative mb-4">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value.toUpperCase())}
                                        placeholder="e.g. BK-123456"
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl text-lg font-bold text-gray-800 outline-none transition-all shadow-sm"
                                        style={{ borderColor: 'transparent', '--tw-ring-color': theme?.primaryColor || '#14b8a6' } as any}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{
                                        background: theme ? `linear-gradient(to right, ${theme.primaryColor}, ${theme.primaryDark})` : 'linear-gradient(to right, #14b8a6, #0f766e)',
                                        boxShadow: theme ? `0 10px 15px -3px ${theme.primaryColor}33` : '0 10px 15px -3px rgba(20, 184, 166, 0.2)'
                                    }}
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Find My Booking'}
                                </button>
                            </form>

                            {error && (
                                <div className="mt-6 p-4 rounded-2xl flex items-center gap-3 justify-center border animate-shake"
                                    style={{
                                        backgroundColor: theme?.warningColor ? `${theme.warningColor}1a` : '#fef2f2',
                                        color: theme?.warningColor || '#dc2626',
                                        borderColor: theme?.warningColor ? `${theme.warningColor}33` : '#fee2e2'
                                    }}>
                                    <AlertTriangle className="w-5 h-5" />
                                    <span className="font-semibold text-sm">{error}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Status Message */}
                            {successMessage && (
                                <div className="p-4 rounded-2xl border flex items-center gap-3 animate-slide-up"
                                    style={{
                                        backgroundColor: theme?.successColor ? `${theme.successColor}1a` : '#ecfdf5',
                                        color: theme?.successColor || '#047857',
                                        borderColor: theme?.successColor ? `${theme.successColor}33` : '#d1fae5'
                                    }}>
                                    <CheckCircle2 className="w-6 h-6" />
                                    <span className="font-bold">{successMessage}</span>
                                </div>
                            )}

                            {booking.status === 'cancelled' && !successMessage && (
                                <div className="p-4 bg-gray-100 text-gray-600 rounded-2xl border border-gray-200 flex items-center gap-3 font-bold">
                                    <XCircle className="w-6 h-6" />
                                    This booking has been cancelled.
                                </div>
                            )}

                            {/* Booking Summary Card */}
                            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6 flex items-center justify-between" style={{
                                    background: theme ? `linear-gradient(to right, ${theme.primaryColor}, ${theme.primaryDark})` : 'linear-gradient(to right, #14b8a6, #0f766e)'
                                }}>
                                    <div>
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">Booking Reference</p>
                                        <h2 className="text-xl font-black text-white">{booking.bookingReference}</h2>
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white border border-white/30 backdrop-blur-md">
                                        {booking.status}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Route & Vehicle */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Itinerary</h3>
                                            <div className="space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg shrink-0">
                                                        <MapPin className="w-3.5 h-3.5" style={{ color: theme?.primaryColor || '#14b8a6' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Pickup</p>
                                                        <p className="text-sm font-bold text-gray-800 leading-tight">{booking.fromLocation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-3">
                                                    <div className="mt-1 p-2 bg-gray-50 rounded-lg shrink-0">
                                                        <MapPin className="w-3.5 h-3.5" style={{ color: theme?.secondaryColor || '#3b82f6' }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Dropoff</p>
                                                        <p className="text-sm font-bold text-gray-800 leading-tight">{booking.toLocation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Date</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <Calendar className="w-3.5 h-3.5 mb-1" style={{ color: theme?.primaryColor || '#14b8a6' }} />
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Date</p>
                                                    <p className="text-xs font-black text-gray-800">{booking.date}</p>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <Clock className="w-3.5 h-3.5 mb-1" style={{ color: theme?.primaryColor || '#14b8a6' }} />
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Time</p>
                                                    <p className="text-xs font-black text-gray-800">{booking.pickupTime}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vehicle Details */}
                                    <div className="p-5 bg-[#0F172A] rounded-2xl text-white relative overflow-hidden group">
                                        <div className="absolute right-0 bottom-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                            <Car className="w-20 h-20" />
                                        </div>
                                        <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Selected Vehicle</h3>
                                        <div className="flex items-center gap-4 relative z-10">
                                            {booking.selectedVehicle?.image && (
                                                <img src={booking.selectedVehicle.image} alt={booking.selectedVehicle.name} className="w-20 h-12 object-contain rounded-lg" />
                                            )}
                                            <div>
                                                <p className="text-base font-black leading-tight">{booking.selectedVehicle?.name}</p>
                                                <p className="text-sm font-bold" style={{ color: theme?.secondaryColor || '#3b82f6' }}>{booking.currency} {booking.totalPrice.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Passenger Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 border border-gray-100 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Passenger</p>
                                                <p className="text-xs font-bold text-gray-800">{booking.passengerName}</p>
                                            </div>
                                        </div>
                                        <div className="p-3 border border-gray-100 rounded-xl flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Email</p>
                                                <p className="text-xs font-bold text-gray-800 truncate max-w-[120px]">{booking.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cancellation Section */}
                                    {booking.status !== 'cancelled' && (
                                        <div className="pt-4 border-t border-gray-100">
                                            {isWithin24Hours(booking.createdAt) ? (
                                                <div className="p-5 rounded-2xl border"
                                                    style={{
                                                        backgroundColor: theme?.warningColor ? `${theme.warningColor}1a` : '#fffbeb',
                                                        borderColor: theme?.warningColor ? `${theme.warningColor}33` : '#fef3c7'
                                                    }}>
                                                    <div className="flex items-start gap-3 mb-4">
                                                        <div className="p-2 rounded-xl" style={{ backgroundColor: theme?.warningColor ? `${theme.warningColor}33` : '#fef3c7' }}>
                                                            <AlertTriangle className="w-4 h-4" style={{ color: theme?.warningColor || '#d97706' }} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold" style={{ color: theme?.warningColor || '#92400e' }}>Cancellation Policy</h4>
                                                            <p className="text-xs" style={{ color: theme?.warningColor || '#b45309' }}>Free cancellation within 24 hours of creation.</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleCancel}
                                                        disabled={cancelling}
                                                        className="w-full py-3 bg-white border-2 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:opacity-80"
                                                        style={{
                                                            borderColor: '#fee2e2',
                                                            color: '#dc2626'
                                                        }}
                                                    >
                                                        {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                                                    <p className="text-xs text-gray-500 font-medium">Free cancellation window passed.</p>
                                                    <div className="mt-2 flex items-center justify-center gap-3 font-bold text-xs" style={{ color: theme?.primaryColor || '#14b8a6' }}>
                                                        <Phone className="w-3.5 h-3.5" />
                                                        Support: +1 (234) 567-890
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => { setBooking(null); setReference(''); setSuccessMessage(null); setError(null); }}
                                className="w-full py-2 font-bold transition-colors text-xs uppercase tracking-widest"
                                style={{ color: theme?.primaryColor || '#14b8a6' }}
                            >
                                Search Another Reference
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
