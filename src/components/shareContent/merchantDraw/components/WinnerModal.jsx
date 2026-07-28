import { X, Ticket, ChevronRight, Gift, Laptop, Headphones, Smartphone, Star } from 'lucide-react';
import { useTranslation } from '@/locales/useTranslation';
import { sourceKey } from '@/locales/config';

// ─── PRIZE ICON ───────────────────────────────────────────────────────────────

function PrizeIcon({ type, size, color }) {
    const sz = size || 18;
    const s = { width: sz, height: sz, color: color || '#fff' };
    if (type === 'laptop') return <Laptop style={s} />;
    if (type === 'headphones') return <Headphones style={s} />;
    if (type === 'ticket') return <Ticket style={s} />;
    if (type === 'phone') return <Smartphone style={s} />;
    if (type === 'star') return <Star style={s} />;
    return <Gift style={s} />;
}

// ─── WINNER MODAL ─────────────────────────────────────────────────────────────

/**
 * WinnerModal
 * Drop-in replacement for PrizeAnimation — same callback contract, prototype visuals.
 *
 * Props:
 *   wonPrize          – { reward: string, color: string } from spin API response
 *   particles         – confetti array, generated in LuckyDrawFlowPage.handlePrize
 *   isGlobalAvailable – when false, hides the global draw section regardless of join state
 *   hasJoinedGlobal   – when true, hides the global draw section
 *   onClose           – dismiss modal and return to entry step
 *   onGlobalDraw    – navigate to uploadShareProof page  ← NOT onActivate
 *   onViewDashboard – navigate to dashboard page
 *   onDashboard     – legacy alias for onViewDashboard
 */
const WinnerModal = ({
    wonPrize,
    particles = [],
    isGlobalAvailable = false,
    hasJoinedGlobal = false,
    onClose,
    onGlobalDraw,
    onViewDashboard,
    onDashboard,
}) => {
    const { t } = useTranslation();
    const toDashboard = onViewDashboard || onDashboard;
    // Only surface the global draw when the campaign is available AND the user hasn't joined yet
    const showGlobalDraw = isGlobalAvailable && !hasJoinedGlobal;

    // Derive display values from API shape { reward, color }
    const name = wonPrize?.reward || '';
    const color = wonPrize?.color || '#6366f1';
    // Slightly darker shade for gradient end stop
    const colorDark = color + 'cc';

    return (
        <>
            <style>{`
                @keyframes wmParticleFall {
                    0%  { transform: translateY(0) rotate(0deg); opacity: 1; }
                    80% { opacity: 1; }
                    100%{ transform: translateY(600px) translateX(20px) rotate(360deg); opacity: 0; }
                }
                @keyframes wmSlideUp {
                    0%   { transform: translateY(100%); }
                    100% { transform: translateY(0); }
                }
            `}</style>

            {/* Overlay — no backdrop, floats above spin page */}
            <div style={{
                position: 'fixed', inset: 0,
                zIndex: 200,
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: 16,
                pointerEvents: 'none',
            }}>
                {/* Confetti layer */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    {particles.map(p => (
                        <div key={p.id} style={{
                            position: 'absolute',
                            left: `${p.x}%`, top: '-5%',
                            width: p.size, height: p.size,
                            backgroundColor: p.color,
                            borderRadius: p.circle ? '50%' : '20%',
                            animation: `wmParticleFall 2.8s cubic-bezier(0.25,0.46,0.45,0.94) ${p.delay}s infinite`,
                        }} />
                    ))}
                </div>

                {/* Modal card */}
                <div style={{
                    width: '100%', maxWidth: 420,
                    borderRadius: 26, overflow: 'hidden',
                    position: 'relative', zIndex: 2,
                    animation: 'wmSlideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
                    boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
                    pointerEvents: 'auto',
                }}>
                    {/* ── Coloured header ── */}
                    <div style={{
                        background: `linear-gradient(135deg,${color},${colorDark})`,
                        padding: '26px 22px 20px',
                        position: 'relative',
                        textAlign: 'center',
                    }}>
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            style={{
                                position: 'absolute', top: 11, right: 11,
                                width: 30, height: 30, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                border: '1.5px solid rgba(255,255,255,0.35)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <X style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.9)' }} />
                        </button>

                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(255,255,255,0.18)', borderRadius: 20,
                            padding: '4px 12px', marginBottom: 14,
                        }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                {t("prizeUnlocked", sourceKey.user)}
                            </span>
                        </div>

                        {/* Prize icon */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 9 }}>
                            <div style={{ padding: 13, borderRadius: 18, background: 'rgba(255,255,255,0.2)' }}>
                                <PrizeIcon type="gift" size={34} color="rgba(255,255,255,0.95)" />
                            </div>
                        </div>

                        {/* Prize name */}
                        <h2 style={{ margin: '0 0 3px', fontSize: 26, fontWeight: 900, color: '#fff' }}>
                            {name}
                        </h2>
                        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
                            {t("showCashierToRedeem", sourceKey.user)}
                        </p>
                    </div>

                    {/* ── White body ── */}
                    <div style={{ background: '#fff', padding: '18px 22px 22px' }}>

                        {/* Grand ticket promo — only when global draw is available and not yet joined */}
                        {showGlobalDraw && (
                            <div style={{
                                padding: '12px 13px', borderRadius: 12,
                                background: '#FFFBEB', border: '1px solid #FDE68A',
                                marginBottom: 14,
                                display: 'flex', gap: 9, alignItems: 'flex-start',
                            }}>
                                <Ticket style={{ width: 16, height: 16, color: '#D97706', flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 900, color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                                        {t("grandTicketUnlocked", sourceKey.user)}
                                    </p>
                                    <p style={{ margin: 0, fontSize: 11, color: '#78350F', lineHeight: 1.6 }}>
                                        {t("grandTicketDesc", sourceKey.user)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

                            {/* Global draw action */}
                            {showGlobalDraw && onGlobalDraw && (
                                <button
                                    onClick={onGlobalDraw}
                                    style={{
                                        padding: '12px', borderRadius: 11, border: 'none',
                                        background: `linear-gradient(135deg,${color},${colorDark})`,
                                        color: '#fff', fontSize: 13, fontWeight: 900,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                                        boxShadow: `0 4px 14px ${color}55`,
                                    }}
                                >
                                    <Ticket style={{ width: 15, height: 15 }} />
                                    {t("activateGrandTicket", sourceKey.user)}
                                    <ChevronRight style={{ width: 15, height: 15 }} />
                                </button>
                            )}

                            {/* View Dashboard */}
                            {toDashboard && (
                                <button
                                    onClick={toDashboard}
                                    style={{
                                        padding: '10px', borderRadius: 11,
                                        border: `1px solid ${color}44`,
                                        background: 'none', color: color,
                                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    }}
                                >
                                    {t("viewDashboard", sourceKey.user)}
                                </button>
                            )}

                            {/* Dismiss */}
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '10px', borderRadius: 11,
                                    border: '1px solid #E2E8F0',
                                    background: 'none', color: '#64748B',
                                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                }}
                            >
                                {t("noThanksBackToHome", sourceKey.user)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WinnerModal;
