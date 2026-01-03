"use client"

import { useState, useEffect } from "react"
import {
    X,
    RefreshCw,
    ArrowRightLeft,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Search,
    ChevronDown,
    Wallet
} from "lucide-react"
import { getExchangeRates, convertPrice, ALL_CURRENCIES } from "@/lib/currency"

interface CurrencyConverterProps {
    isOpen: boolean
    onClose: () => void
}

export function CurrencyConverter({ isOpen, onClose }: CurrencyConverterProps) {
    const [rates, setRates] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState<string>("100")
    const [fromCurrency, setFromCurrency] = useState("USD")
    const [toCurrency, setToCurrency] = useState("PKR")
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchRates = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getExchangeRates('USD')
            if (data) {
                setRates(data)
            } else {
                setError("Failed to fetch rates")
            }
        } catch (err) {
            setError("Error connecting to terminal")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen && !rates) {
            fetchRates()
        }
    }, [isOpen, rates])

    const convertedAmount = rates && fromCurrency && toCurrency
        ? convertPrice(parseFloat(amount) || 0, rates[fromCurrency], rates[toCurrency])
        : 0

    const filteredCurrencies = ALL_CURRENCIES.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md h-[calc(100vh-2rem)] rounded-3xl shadow-2xl border border-gray-100 flex flex-col animate-slide-in-right overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-100">
                            <RefreshCw className={`w-5 h-5 text-teal-600 ${loading ? 'animate-spin' : ''}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Currency Converter</h2>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Real-time Exchange Rates</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Converter Section */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Amount</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                                        {ALL_CURRENCIES.find(c => c.code === fromCurrency)?.symbol || ""}
                                    </div>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-transparent focus:border-teal-500 rounded-xl text-xl font-bold text-gray-800 outline-none transition-all shadow-sm"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">From</label>
                                    <select
                                        value={fromCurrency}
                                        onChange={(e) => setFromCurrency(e.target.value)}
                                        className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
                                    >
                                        {ALL_CURRENCIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            const temp = fromCurrency
                                            setFromCurrency(toCurrency)
                                            setToCurrency(temp)
                                        }}
                                        className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-400 hover:text-teal-600 transition-all hover:scale-110 active:scale-95 shadow-sm"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">To</label>
                                    <select
                                        value={toCurrency}
                                        onChange={(e) => setToCurrency(e.target.value)}
                                        className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
                                    >
                                        {ALL_CURRENCIES.map(c => (
                                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Result Display */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Wallet className="w-24 h-24" />
                            </div>
                            <p className="text-gray-400 text-sm font-medium mb-1">Total Converted Value</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tight">
                                    {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-teal-400 font-bold text-xl">{toCurrency}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                1 {fromCurrency} = {(rates && rates[fromCurrency] && rates[toCurrency] ? rates[toCurrency] / rates[fromCurrency] : 0).toFixed(4)} {toCurrency}
                            </div>
                        </div>
                    </div>

                    {/* Market Watch Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Live Market Watch
                            </h3>
                            <button
                                onClick={fetchRates}
                                className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-widest flex items-center gap-1.5"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                Update
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search currency..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                            {loading && !rates ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-14 bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
                                ))
                            ) : (
                                filteredCurrencies.map(c => {
                                    const rate = rates ? rates[c.code] : 0
                                    return (
                                        <div
                                            key={c.code}
                                            className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-xl hover:border-teal-500/30 hover:shadow-md transition-all group cursor-pointer"
                                            onClick={() => setToCurrency(c.code)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-50 group-hover:bg-teal-50 rounded-lg flex items-center justify-center font-bold text-gray-500 group-hover:text-teal-600 transition-colors">
                                                    {c.symbol}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 leading-none mb-1">{c.code}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium uppercase">{c.name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-gray-900 leading-none mb-1">
                                                    {rate ? rate.toLocaleString(undefined, { maximumFractionDigits: 3 }) : "---"}
                                                </p>
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">Live</span>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3.5 bg-white border border-gray-200 hover:border-teal-500 hover:text-teal-600 rounded-xl font-bold text-gray-600 transition-all shadow-sm"
                    >
                        Close Tools
                    </button>
                </div>
            </div>
        </div>
    )
}
