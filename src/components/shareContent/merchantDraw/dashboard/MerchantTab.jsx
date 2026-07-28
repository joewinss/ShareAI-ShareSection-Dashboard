import React, { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, Phone, Navigation, Share2, Star, Sparkles, ChevronDown, Ticket, Coins, CreditCard } from "lucide-react";
import { useTranslation } from "@/locales/useTranslation";
import { sourceKey } from "@/locales/config";
import { formatDate } from "@/utility/common-functions";
import { message } from "antd";
import MerchantDetailModal from "./MerchantDetailModal";

/**
 * MerchantTab Component with Merchant Credit Points Pairing:
 * - Shows user's credit points balance paired for each merchant
 * - Top credit summary banner
 * - Coupon ticket visual cards with required credit points cost
 * - Interactive Merchant Detail Modal with Vouchers & Drop a Review
 */
const MerchantTab = ({ prizes = [], loading = false, phone }) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedLocation, setSelectedLocation] = useState("Bangsar South, Kuala Lumpur");
    const [selectedMerchant, setSelectedMerchant] = useState(null);

    // Group prizes or mock sample merchants with paired user credit points
    const merchantData = useMemo(() => {
        const defaultMerchants = [
            {
                id: "m1",
                name: "Burger King KL Gateway Mall",
                logo: "🍔",
                logoBg: "bg-amber-100 text-amber-700",
                userCredits: 250,
                creditName: "BK Credits",
                rating: 4.5,
                reviewsCount: 287,
                distance: "489m",
                priceRange: "RM10-30",
                status: "Open",
                closingTime: "11:00PM",
                location: "KL Gateway Mall",
                phoneNo: "+60322421234",
                deals: [
                    { id: "d1", title: "RM10 Cash Off", discountValue: "RM10 OFF", badge: "Active Voucher", minSpend: "Min. spend RM30", creditCost: 100, bgGradient: "from-blue-600 to-indigo-700" },
                    { id: "d2", title: "RM5 Cash Voucher", discountValue: "RM5 OFF", badge: "Active Voucher", minSpend: "Min. spend RM15", creditCost: 50, bgGradient: "from-amber-500 to-orange-600" },
                    { id: "d3", title: "15% Discount Off", discountValue: "15% OFF", badge: "Active Voucher", minSpend: "Min. spend RM25", creditCost: 80, bgGradient: "from-emerald-600 to-teal-700" },
                ],
            },
            {
                id: "m2",
                name: "Coolblog KL Gateway",
                logo: "🧋",
                logoBg: "bg-pink-100 text-pink-700",
                userCredits: 120,
                creditName: "Cool Points",
                rating: 4.8,
                reviewsCount: 190,
                distance: "445m",
                priceRange: "RM5-20",
                status: "Open",
                closingTime: "10:00PM",
                location: "KL Gateway Mall",
                phoneNo: "+60322425678",
                deals: [
                    { id: "d4", title: "RM3 Beverage Discount", discountValue: "RM3 OFF", badge: "Active Voucher", minSpend: "Min. spend RM10", creditCost: 30, bgGradient: "from-pink-600 to-rose-700" },
                    { id: "d5", title: "20% OFF Total Bill", discountValue: "20% OFF", badge: "Active Voucher", minSpend: "Min. spend RM20", creditCost: 60, bgGradient: "from-purple-600 to-indigo-700" },
                ],
            },
            {
                id: "m3",
                name: "Starbucks Nexus Bangsar",
                logo: "☕",
                logoBg: "bg-emerald-100 text-emerald-700",
                userCredits: 500,
                creditName: "Star Credits",
                rating: 4.7,
                reviewsCount: 412,
                distance: "620m",
                priceRange: "RM15-35",
                status: "Open",
                closingTime: "10:30PM",
                location: "Nexus Bangsar South",
                phoneNo: "+60322429988",
                deals: [
                    { id: "d6", title: "RM5 Coffee Voucher", discountValue: "RM5 OFF", badge: "Active Voucher", minSpend: "Min. spend RM20", creditCost: 50, bgGradient: "from-emerald-600 to-teal-700" },
                    { id: "d7", title: "10% OFF Any Pastry", discountValue: "10% OFF", badge: "Active Voucher", minSpend: "Min. spend RM15", creditCost: 40, bgGradient: "from-amber-600 to-yellow-600" },
                ],
            },
        ];

        // If user has real merchant prizes, prepend them as merchant cards
        if (prizes && prizes.length > 0) {
            const userPrizesAsMerchant = {
                id: "user-prizes",
                name: "My Won Merchant Prizes",
                logo: "🎁",
                logoBg: "bg-purple-100 text-purple-700",
                userCredits: 1000,
                creditName: "Reward Pts",
                rating: 5.0,
                reviewsCount: prizes.length,
                distance: "Nearby",
                priceRange: "Free",
                status: "Active",
                closingTime: "Anytime",
                location: "My Wallet",
                phoneNo: phone || "",
                deals: prizes.map((p, idx) => ({
                    id: `p-${idx}`,
                    title: p.reward || "Merchant Reward",
                    discountValue: "FREE REWARD",
                    badge: "Active Voucher",
                    minSpend: formatDate(p.createdAt, "DD MMM YYYY"),
                    creditCost: 0,
                    bgGradient: "from-purple-600 to-indigo-700",
                })),
            };
            return [userPrizesAsMerchant, ...defaultMerchants];
        }

        return defaultMerchants;
    }, [prizes, phone]);

    // Calculate total paired credit points
    const totalMerchantCredits = useMemo(() => {
        return merchantData.reduce((acc, curr) => acc + (curr.userCredits || 0), 0);
    }, [merchantData]);

    // Filter merchants based on search
    const filteredMerchants = useMemo(() => {
        if (!searchQuery.trim()) return merchantData;
        const q = searchQuery.toLowerCase();
        return merchantData.filter((m) =>
            m.name.toLowerCase().includes(q) ||
            m.deals.some((d) => d.title.toLowerCase().includes(q))
        );
    }, [merchantData, searchQuery]);

    const handleShareMerchant = (merchantName) => {
        const shareText = `Check out discount vouchers at ${merchantName}! 🎟`;
        if (navigator?.share) {
            navigator.share({ text: shareText }).catch(() => {});
        } else {
            navigator.clipboard.writeText(shareText);
            message.success("Share link copied to clipboard!");
        }
    };

    const handleCallMerchant = (phoneNo) => {
        if (phoneNo) {
            window.open(`tel:${phoneNo}`);
        } else {
            message.info("Phone number not available");
        }
    };

    const handleDirections = (location) => {
        window.open(`https://maps.google.com/?q=${encodeURIComponent(location)}`, "_blank");
    };

    return (
        <div className="space-y-4 animate-fade-in pb-4">
            {/* Top Location Bar */}
            <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 fill-blue-600 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your location</p>
                        <div className="flex items-center gap-1">
                            <p className="text-xs font-extrabold text-slate-900 truncate">{selectedLocation}</p>
                            <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Merchant Credit Points Summary Banner (Light Theme) */}
            <div className="bg-white rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] border border-amber-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100/90 text-amber-800 flex items-center justify-center font-black shrink-0 border border-amber-200/60 shadow-inner">
                        <Coins className="w-5 h-5 fill-amber-500 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">My Merchant Credits</p>
                        <p className="text-base font-black text-slate-900 tracking-tight">
                            {totalMerchantCredits.toLocaleString()} <span className="text-xs font-bold text-slate-400">Pts Balance</span>
                        </p>
                    </div>
                </div>
                <span className="text-xs font-extrabold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200/80 shadow-xs">
                    {merchantData.length} Stores
                </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search merchant, vouchers, or credits..."
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 shadow-sm"
                />
            </div>

            {/* Horizontal Filter Tags Bar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    type="button"
                    className="shrink-0 p-2 bg-white rounded-xl border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter("deals")}
                    className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        activeFilter === "deals"
                            ? "bg-amber-500 text-white border border-amber-500"
                            : "bg-white text-slate-600 border border-slate-100"
                    }`}
                >
                    🎟 Voucher Deals
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter("top")}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        activeFilter === "top"
                            ? "bg-teal-600 text-white border border-teal-600"
                            : "bg-white text-slate-600 border border-slate-100"
                    }`}
                >
                    Top Rated
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter("nearby")}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        activeFilter === "nearby"
                            ? "bg-teal-600 text-white border border-teal-600"
                            : "bg-white text-slate-600 border border-slate-100"
                    }`}
                >
                    Nearest
                </button>
            </div>

            {/* Merchant Cards Stream */}
            <div className="space-y-4">
                {filteredMerchants.map((merchant) => (
                    <div
                        key={merchant.id}
                        onClick={() => setSelectedMerchant(merchant)}
                        className="bg-[#fffdfa] rounded-3xl border border-amber-200/60 shadow-[0_10px_30px_rgba(15,23,42,0.04)] overflow-hidden relative cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
                    >
                        {/* Top Ribbon & Paired Merchant Credit Points Badge */}
                        <div className="flex items-center justify-between bg-amber-50/50 border-b border-amber-100/60 px-3.5 py-2">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 inline-flex items-center gap-1 rounded-full shadow-xs">
                                🎟 VOUCHER DEALS
                            </div>

                            {/* Merchant Paired Credits Badge */}
                            <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                <Coins className="w-3 h-3 fill-slate-950" />
                                <span>{merchant.userCredits} Pts</span>
                            </div>
                        </div>

                        {/* Merchant Header */}
                        <div className="p-4 pt-3 flex items-start gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner ${merchant.logoBg}`}>
                                {merchant.logo}
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                    <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                                        {merchant.name}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                                    <span className="flex items-center gap-0.5 font-bold text-slate-900">
                                        {merchant.rating} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    </span>
                                    <span>({merchant.reviewsCount})</span>
                                    <span>•</span>
                                    <span>{merchant.distance}</span>
                                    <span>•</span>
                                    <span>{merchant.priceRange}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs mt-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-bold text-emerald-600">{merchant.status}</span>
                                        <span className="text-slate-400">• Closes {merchant.closingTime}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                        Available Balance: {merchant.userCredits} Pts
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Discount Vouchers Horizontal Carousel */}
                        <div className="px-4 pb-3">
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                {merchant.deals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="shrink-0 w-36 bg-white rounded-2xl p-2.5 border border-slate-100 shadow-sm flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Discount Coupon Ticket Graphic */}
                                            <div className={`relative w-full h-20 rounded-xl bg-gradient-to-br ${deal.bgGradient} p-2 flex flex-col items-center justify-center text-white overflow-hidden mb-2 shadow-inner`}>
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white rounded-r-full" />
                                                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white rounded-l-full" />
                                                <Ticket className="w-4 h-4 text-white/80 mb-0.5" />
                                                <p className="text-sm font-black tracking-tight text-center leading-none">
                                                    {deal.discountValue}
                                                </p>
                                                {deal.creditCost != null && deal.creditCost > 0 && (
                                                    <span className="mt-1 bg-white/20 backdrop-blur-md text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border border-white/20">
                                                        🪙 {deal.creditCost} Pts
                                                    </span>
                                                )}
                                            </div>

                                            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded-full mb-1">
                                                {deal.badge || "Active Voucher"}
                                            </span>

                                            <p className="text-xs font-extrabold text-slate-900 line-clamp-1 leading-tight">
                                                {deal.title}
                                            </p>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between text-[10px]">
                                            <span className="font-bold text-slate-400 truncate">
                                                {deal.minSpend}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="px-4 py-3 border-t border-slate-100/80 flex items-center gap-2 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => handleDirections(merchant.location)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors"
                            >
                                <Navigation className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                                Directions
                            </button>

                            <button
                                type="button"
                                onClick={() => handleCallMerchant(merchant.phoneNo)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors"
                            >
                                <Phone className="w-3.5 h-3.5 fill-blue-700 text-blue-700" />
                                Call
                            </button>

                            <button
                                type="button"
                                onClick={() => handleShareMerchant(merchant.name)}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-extrabold py-2 px-3 rounded-xl transition-colors"
                            >
                                <Share2 className="w-3.5 h-3.5 text-blue-700" />
                                Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Promo Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                    <p className="text-xs font-bold">Shake to discover nearby discount vouchers!</p>
                </div>
                <span className="text-xl">🎟</span>
            </div>

            {/* Merchant Detail & Drop Review Modal */}
            {selectedMerchant && (
                <MerchantDetailModal
                    merchant={selectedMerchant}
                    onClose={() => setSelectedMerchant(null)}
                    phone={phone}
                />
            )}
        </div>
    );
};

export default MerchantTab;
