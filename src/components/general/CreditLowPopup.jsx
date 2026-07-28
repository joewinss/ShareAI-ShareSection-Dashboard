import React, { useEffect, useState } from 'react';
import { getCreditPopupState } from '@/utility/creditPopupUtils';
import { CREDIT_TYPE } from '@/constants/user';

const ImageIcon = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const ContentIcon = ({ color }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"
    style={{ flexShrink: 0, marginTop: 1 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

function CreditRowWithLimit({ credit, isBlocked }) {
  const used = credit.actualUsed || 0;
  const total = credit.limit;
  const remaining = Math.max(total - used, 0);
  const usedPct = Math.min(Math.round((used / total) * 100), 100);
  const isImage = credit.creditType === CREDIT_TYPE.IMAGE;
  const label = isImage ? 'Visual Credits' : 'Content Credits';
  const iconColor = isBlocked ? '#991b1b' : '#92400e';

  return (
    <div style={{
      background: isBlocked ? '#fef2f2' : '#fff8f0',
      border: `1.5px solid ${isBlocked ? '#fecaca' : '#fed7aa'}`,
      borderRadius: 12,
      padding: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isImage ? <ImageIcon color={iconColor} /> : <ContentIcon color={iconColor} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: iconColor }}>{label}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: '#dc2626', lineHeight: 1 }}>{remaining}</span>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}> / {total} left</span>
        </div>
      </div>
      <div style={{ background: isBlocked ? '#fecaca' : '#e5e7eb', borderRadius: 6, height: 10, overflow: 'hidden' }}>
        <div style={{
          background: isBlocked
            ? 'linear-gradient(to right,#7f1d1d,#dc2626)'
            : 'linear-gradient(to right,#dc2626,#f59e0b)',
          width: isBlocked ? '100%' : `${usedPct}%`,
          height: 10,
          borderRadius: 6,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 9, color: '#dc2626', fontWeight: isBlocked ? 800 : 700 }}>
          {isBlocked ? '100% USED — EMPTY' : `${usedPct}% USED`}
        </span>
        <span style={{ fontSize: 9, color: isBlocked ? '#fca5a5' : '#9ca3af' }}>
          {isBlocked ? '0 remaining' : `Only ${100 - usedPct}% left`}
        </span>
      </div>
    </div>
  );
}

function CreditCardNoLimit({ credit, isBlocked }) {
  const remaining = credit.availableAmount || 0;
  const isImage = credit.creditType === CREDIT_TYPE.IMAGE;
  const label = isImage ? 'VISUAL CREDITS' : 'CONTENT CREDITS';
  const iconColor = isBlocked ? '#991b1b' : '#92400e';
  const borderColor = isBlocked ? '#dc2626' : '#fed7aa';
  const bg = isBlocked ? '#fef2f2' : '#fff8f0';

  return (
    <div style={{ background: bg, border: `2px solid ${borderColor}`, borderRadius: 14, padding: '14px 12px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {isBlocked && (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(220,38,38,0.05),rgba(220,38,38,0.12))' }} />
      )}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
          {isImage ? <ImageIcon color={iconColor} /> : <ContentIcon color={iconColor} />}
          <span style={{ fontSize: 9, color: iconColor, fontWeight: 700, letterSpacing: '0.8px' }}>{label}</span>
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, color: '#dc2626', lineHeight: 1, textShadow: isBlocked ? '0 2px 8px rgba(220,38,38,0.3)' : 'none' }}>
          {remaining}
        </div>
        {isBlocked && (
          <div style={{ marginTop: 5, fontSize: 9, fontWeight: 700, color: '#dc2626', background: '#fecaca', borderRadius: 10, padding: '2px 6px', display: 'inline-block' }}>
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
}

function getTitle(creditsToShow, state) {
  const isBlocked = state === 'blocked';
  const types = creditsToShow.map(c => c.credit.creditType);
  const hasImage = types.includes(CREDIT_TYPE.IMAGE);
  const hasContent = types.includes(CREDIT_TYPE.CONTENT);
  if (hasImage && hasContent) return isBlocked ? 'Credits Exhausted' : 'Credits Running Out';
  if (hasImage) return isBlocked ? 'Visual Credits Exhausted' : 'Visual Credits Low';
  return isBlocked ? 'Content Credits Exhausted' : 'Content Credits Low';
}

function getSubtitle(state) {
  return state === 'blocked'
    ? "You can't generate until you top up"
    : 'Top up soon to avoid interruption';
}

export default function CreditLowPopup({ isCollapsed, credits, role, userId }) {
  const [visible, setVisible] = useState(false);
  const [popupState, setPopupState] = useState(null);

  useEffect(() => {
    if (!userId || !credits?.length) return;

    const result = getCreditPopupState(credits, role);
    if (!result.show) return;

    const key = result.state === 'blocked'
      ? `creditBlockedShown_${userId}`
      : `creditWarningShown_${userId}`;

    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, '1');
    setPopupState(result);
    setVisible(true);
  }, [credits, role, userId]);

  const handleDismiss = () => setVisible(false);

  if (!visible || !popupState) return null;

  const { state, creditsToShow } = popupState;
  const isBlocked = state === 'blocked';
  const title = getTitle(creditsToShow, state);
  const subtitle = getSubtitle(state);
  const infoNote = role === 'outlet'
    ? 'Contact your MasterHQ to top up credits.'
    : 'Contact us to top up credits.';
  const buttonText = isBlocked ? 'Understood' : 'Got it';

  // Limit-based progress row is only meaningful for outlet users with a limit set.
  // masterHQ always uses availableAmount, so it always gets the number card —
  // this must mirror the remaining calculation in classifyCredit.
  const usesLimitRow = ({ credit }) =>
    role === 'outlet' && credit.limit != null && credit.limit > 0;

  const allNumberCards = creditsToShow.every((c) => !usesLimitRow(c));
  const sideBySide = allNumberCards && creditsToShow.length === 2;

  const headerGradient = isBlocked
    ? 'linear-gradient(135deg,#7f1d1d 0%,#dc2626 100%)'
    : 'linear-gradient(135deg,#dc2626 0%,#f59e0b 100%)';

  const cardShadow = isBlocked
    ? '0 32px 80px rgba(220,38,38,0.45)'
    : '0 32px 80px rgba(245,158,11,0.35)';

  // Plain JSX variables, NOT inline components — credits poll every 30s and an
  // inline component type would remount each render, restarting the pulse animation.
  const header = (
    <div style={{ background: headerGradient, padding: '22px 20px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -24, left: -24, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ position: 'absolute', bottom: -18, right: -18, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '3px 10px', marginBottom: 10 }}>
        {isBlocked
          ? <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
          : <div className="animate-pulse" style={{ width: 6, height: 6, background: '#fff', borderRadius: '50%' }} />
        }
        <span style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
          {isBlocked ? 'BLOCKED' : 'CRITICAL'}
        </span>
      </div>
      <div style={{ color: 'white', fontWeight: 900, fontSize: 17, lineHeight: 1.2, marginBottom: 4 }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{subtitle}</div>
    </div>
  );

  const body = (
    <div style={{ padding: 18 }}>
      {sideBySide ? (
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {creditsToShow.map(({ credit, status }) => (
            <div key={credit.creditType} style={{ flex: 1 }}>
              <CreditCardNoLimit credit={credit} isBlocked={status === 'blocked'} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {creditsToShow.map((item) =>
            usesLimitRow(item)
              ? <CreditRowWithLimit key={item.credit.creditType} credit={item.credit} isBlocked={item.status === 'blocked'} />
              : <CreditCardNoLimit key={item.credit.creditType} credit={item.credit} isBlocked={item.status === 'blocked'} />
          )}
        </div>
      )}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 11px', marginBottom: 14, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
        <InfoIcon />
        <span style={{ fontSize: 11, color: '#991b1b', lineHeight: 1.5 }}>{infoNote}</span>
      </div>
      <button
        onClick={handleDismiss}
        style={{ width: '100%', padding: 12, background: 'linear-gradient(to right,#059669,#2563eb)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: '0.3px', marginBottom: isBlocked ? 0 : 8 }}
      >
        {buttonText}
      </button>
      {!isBlocked && (
        <div onClick={handleDismiss} style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', cursor: 'pointer', paddingTop: 2 }}>
          Maybe later
        </div>
      )}
    </div>
  );

  const animationStyles = (
    <style jsx global>{`
      @keyframes creditPopupSheetUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
      @keyframes creditPopupFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
  );

  if (isCollapsed) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {animationStyles}
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={!isBlocked ? handleDismiss : undefined}
        />
        <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: '20px 20px 0 0', overflow: 'hidden', boxShadow: cardShadow, animation: 'creditPopupSheetUp 0.3s ease-out' }}>
          <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '12px auto 0' }} />
          {header}
          {body}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {animationStyles}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={!isBlocked ? handleDismiss : undefined}
      />
      <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: 20, width: 360, maxWidth: '100%', overflow: 'hidden', boxShadow: cardShadow, animation: 'creditPopupFadeIn 0.25s ease-out' }}>
        {header}
        {body}
      </div>
    </div>
  );
}
