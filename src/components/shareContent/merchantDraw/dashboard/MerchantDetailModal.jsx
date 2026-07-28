import React, { useState } from "react";
import { ArrowLeft, Share2, MoreVertical, Star, MapPin, Clock, Phone, Navigation, Ticket, ThumbsUp, MessageSquare, X, Send, Camera } from "lucide-react";
import { message } from "antd";

const MerchantDetailModal = ({ merchant, onClose, phone }) => {
    const [activeTab, setActiveTab] = useState("vouchers"); // "vouchers" | "reviews"
    const [reviewFilter, setReviewFilter] = useState("all"); // "all" | "latest"
    const [isWritingReview, setIsWritingReview] = useState(false);

    // Review form state
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [reviewerName, setReviewerName] = useState(phone || "User " + Math.floor(1000 + Math.random() * 9000));

    // Sample reviews list with initial state so user can add new reviews
    const [reviews, setReviews] = useState([
        {
            id: "r1",
            userName: "CAO PINLIN",
            userAvatar: "👤",
            rating: 5,
            postedDate: "16/07/2026",
            comment: "Good service and delicious meals!",
        },
        {
            id: "r2",
            userName: "TNGD Test four",
            userAvatar: "👤",
            rating: 5,
            postedDate: "07/07/2026",
            comment: "Very quick redemption process. Value for money!",
        },
        {
            id: "r3",
            userName: "Ahmad Zaki",
            userAvatar: "👤",
            rating: 4,
            postedDate: "02/07/2026",
            comment: "Clean store environment and helpful staff.",
        },
    ]);

    if (!merchant) return null;

    const handleClaimVoucher = (dealTitle) => {
        message.success(`Claimed voucher: ${dealTitle}! Saved to your Voucher Wallet.`);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!comment.trim()) {
            message.warning("Please enter a short comment for your review.");
            return;
        }

        const newReview = {
            id: `r-${Date.now()}`,
            userName: reviewerName.trim() || "Anonymous User",
            userAvatar: "👤",
            rating: rating,
            postedDate: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }),
            comment: comment.trim(),
        };

        setReviews([newReview, ...reviews]);
        setComment("");
        setIsWritingReview(false);
        setActiveTab("reviews");
        message.success("Thank you! Your review has been submitted successfully.");
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center overflow-y-auto p-0 sm:p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-slide-up">
                {/* Header Navbar */}
                <div className="relative bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <span className="text-sm font-extrabold text-slate-900 truncate max-w-[200px]">
                        {merchant.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                navigator?.clipboard?.writeText(window.location.href);
                                message.success("Link copied!");
                            }}
                            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content Container */}
                <div className="overflow-y-auto flex-1 no-scrollbar space-y-4">
                    {/* Merchant Hero Cover Banner */}
                    <div className="relative w-full h-36 sm:h-40 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 overflow-hidden flex items-center justify-center border-b border-amber-200/60 shadow-inner">
                        {/* Decorative Background Food Pattern */}
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />
                        
                        <div className="relative z-10 flex items-center justify-around w-full px-6">
                            <div className="flex flex-col items-center transition-transform hover:scale-110">
                                <span className="text-4xl drop-shadow-md">🍔</span>
                                <span className="text-[10px] font-black text-amber-900 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/60 shadow-xs">Burgers</span>
                            </div>
                            <div className="flex flex-col items-center transition-transform hover:scale-110">
                                <span className="text-4xl drop-shadow-md">🍟</span>
                                <span className="text-[10px] font-black text-amber-900 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/60 shadow-xs">Fries</span>
                            </div>
                            <div className="flex flex-col items-center transition-transform hover:scale-110">
                                <span className="text-4xl drop-shadow-md">🍗</span>
                                <span className="text-[10px] font-black text-amber-900 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/60 shadow-xs">Nuggets</span>
                            </div>
                            <div className="flex flex-col items-center transition-transform hover:scale-110">
                                <span className="text-4xl drop-shadow-md">🥤</span>
                                <span className="text-[10px] font-black text-amber-900 bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full mt-1 border border-white/60 shadow-xs">Drinks</span>
                            </div>
                        </div>

                        <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1 shadow-sm">
                            ⭐ Store Banner
                        </span>
                    </div>

                    {/* Store Title & Rating Profile */}
                    <div className="px-5 pt-1">
                        <div className="flex items-start gap-3.5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-sm border border-amber-200/80 ${merchant.logoBg || "bg-amber-100 text-amber-700"}`}>
                                {merchant.logo || "🏪"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg font-black text-slate-900 leading-tight">
                                    {merchant.name}
                                </h2>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium flex-wrap">
                                    <span className="font-extrabold text-slate-900 flex items-center gap-0.5 bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded-md">
                                        {merchant.rating || "4.5"} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    </span>
                                    <span>({reviews.length + (merchant.reviewsCount || 200)} reviews)</span>
                                    <span>•</span>
                                    <span>{merchant.distance || "489m"}</span>
                                    <span>•</span>
                                    <span>{merchant.priceRange || "RM20-40"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs mt-1.5">
                                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                        Open
                                    </span>
                                    <span className="text-slate-400 font-medium">Closes {merchant.closingTime || "11:00PM"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub-Navigation Tabs: Voucher vs Reviews */}
                    <div className="px-5 border-b border-slate-100 flex items-center gap-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab("vouchers")}
                            className={`py-3 text-sm font-black transition-all relative ${
                                activeTab === "vouchers"
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Voucher ({merchant.deals?.length || 0})
                            {activeTab === "vouchers" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("reviews")}
                            className={`py-3 text-sm font-black transition-all relative ${
                                activeTab === "reviews"
                                    ? "text-blue-600"
                                    : "text-slate-400 hover:text-slate-600"
                            }`}
                        >
                            Reviews ({reviews.length})
                            {activeTab === "reviews" && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                            )}
                        </button>
                    </div>

                    {/* TAB CONTENT 1: VOUCHERS */}
                    {activeTab === "vouchers" && (
                        <div className="px-5 space-y-3 pb-6">
                            {merchant.deals && merchant.deals.length > 0 ? (
                                merchant.deals.map((deal) => (
                                    <div
                                        key={deal.id}
                                        className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm border border-blue-500/30">
                                                <Ticket className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="inline-block bg-blue-50 text-blue-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mb-0.5">
                                                    {deal.badge || "Active Voucher"}
                                                </span>
                                                <h4 className="text-xs font-black text-slate-900 truncate leading-tight">
                                                    {deal.title}
                                                </h4>
                                                <div className="flex items-baseline gap-1.5 mt-0.5">
                                                    <span className="text-base font-black text-blue-600">
                                                        {deal.discountValue}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {deal.minSpend}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleClaimVoucher(deal.title)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-xs shrink-0 transition-colors"
                                        >
                                            Get Voucher
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-xs text-slate-400 py-6">
                                    No active vouchers available for this merchant right now.
                                </p>
                            )}
                        </div>
                    )}

                    {/* TAB CONTENT 2: REVIEWS & DROP A REVIEW */}
                    {activeTab === "reviews" && (
                        <div className="px-5 space-y-4 pb-6">
                            {/* Write / Drop a Review Card (Matching user reference) */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-extrabold text-slate-900">
                                        How was your experience?
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        Share your rating & review with others
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsWritingReview(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Write a review
                                </button>
                            </div>

                            {/* Review Rating Summary Header */}
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-slate-900">
                                        {merchant.rating || "4.5"}
                                    </span>
                                    <div className="flex text-amber-400">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-900">Reviews</span>
                                </div>

                                {/* Review Filter Pills: All / Latest */}
                                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
                                    <button
                                        type="button"
                                        onClick={() => setReviewFilter("all")}
                                        className={`px-3 py-1 rounded-lg transition-all ${
                                            reviewFilter === "all"
                                                ? "bg-white text-slate-900 shadow-xs"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReviewFilter("latest")}
                                        className={`px-3 py-1 rounded-lg transition-all ${
                                            reviewFilter === "latest"
                                                ? "bg-white text-slate-900 shadow-xs"
                                                : "text-slate-500 hover:text-slate-700"
                                        }`}
                                    >
                                        Latest
                                    </button>
                                </div>
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-3">
                                {reviews.map((rev) => (
                                    <div
                                        key={rev.id}
                                        className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                                                    {rev.userAvatar}
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-900">
                                                    {rev.userName}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                Posted {rev.postedDate}
                                            </span>
                                        </div>

                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                    key={s}
                                                    className={`w-3.5 h-3.5 ${
                                                        s <= rev.rating
                                                            ? "fill-amber-400 text-amber-400"
                                                            : "text-slate-200 fill-slate-200"
                                                    }`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                            {rev.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* DROP A REVIEW MODAL / DRAWER */}
            {isWritingReview && (
                <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 animate-slide-up">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                Drop a Review
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsWritingReview(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Merchant info snippet */}
                            <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                <span className="text-2xl">{merchant.logo || "🏪"}</span>
                                <span className="text-xs font-bold text-slate-900 truncate">{merchant.name}</span>
                            </div>

                            {/* Interactive Star Rating Selection */}
                            <div className="text-center space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                    Tap stars to rate experience
                                </label>
                                <div className="flex items-center justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onMouseEnter={() => setHoverRating(s)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(s)}
                                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-7 h-7 ${
                                                    s <= (hoverRating || rating)
                                                        ? "fill-amber-400 text-amber-400"
                                                        : "text-slate-300 fill-slate-100"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-xs font-extrabold text-blue-600 block">
                                    {rating === 5 ? "Excellent 🌟" : rating === 4 ? "Very Good 👍" : rating === 3 ? "Average 👌" : rating === 2 ? "Below Average 😐" : "Poor 👎"}
                                </span>
                            </div>

                            {/* Name Field */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Your Display Name</label>
                                <input
                                    type="text"
                                    value={reviewerName}
                                    onChange={(e) => setReviewerName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Comment Text Area */}
                            <div>
                                <label className="text-xs font-bold text-slate-600 block mb-1">Write your review</label>
                                <textarea
                                    rows={3}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Describe your dining experience, food quality, or service..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none font-medium"
                                />
                            </div>

                            {/* Form Action Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsWritingReview(false)}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-2.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MerchantDetailModal;
