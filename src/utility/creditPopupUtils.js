import { CREDIT_TYPE } from '@/constants/user';

const WARNING_NO_LIMIT_THRESHOLD = 50;
const WARNING_WITH_LIMIT_PCT = 0.20;

// role matches state.user.user.role: 'outlet' | 'masterHQ'
function classifyCredit(credit, role) {
  // Missing credit type in the API response = no popup for that type.
  if (!credit) return 'ok';

  const hasLimit = credit.limit != null && credit.limit > 0;

  let remaining;
  if (role === 'outlet' && hasLimit) {
    remaining = credit.limit - (credit.actualUsed || 0);
  } else {
    // masterHQ and outlets without a limit use availableAmount.
    // Treat missing data as ok — never show a blocked popup on absent fields
    // (matches the null guard in CreditBalance.jsx).
    if (credit.availableAmount == null) return 'ok';
    remaining = credit.availableAmount;
  }

  if (remaining <= 0) return 'blocked';

  if (role === 'outlet' && hasLimit) {
    if (remaining < credit.limit * WARNING_WITH_LIMIT_PCT) return 'warning';
  } else {
    if (remaining < WARNING_NO_LIMIT_THRESHOLD) return 'warning';
  }

  return 'ok';
}

/**
 * @param {Array} credits - array from useCreditBalance data.data
 * @param {string} role - 'outlet' | 'masterHQ'
 * @returns {{ show: false } | { show: true, state: 'warning'|'blocked', creditsToShow: Array }}
 */
export function getCreditPopupState(credits, role) {
  if (!credits || credits.length === 0) return { show: false };

  const imageCredit = credits.find(c => c.creditType === CREDIT_TYPE.IMAGE);
  const contentCredit = credits.find(c => c.creditType === CREDIT_TYPE.CONTENT);

  const imageStatus = classifyCredit(imageCredit, role);
  const contentStatus = classifyCredit(contentCredit, role);

  const affected = [];
  if (imageStatus !== 'ok' && imageCredit) affected.push({ credit: imageCredit, status: imageStatus });
  if (contentStatus !== 'ok' && contentCredit) affected.push({ credit: contentCredit, status: contentStatus });

  if (affected.length === 0) return { show: false };

  const overallState = affected.some(a => a.status === 'blocked') ? 'blocked' : 'warning';

  return { show: true, state: overallState, creditsToShow: affected };
}
