const RECENT_DAYS = 14;
const VERIFIED_STATE = {
  value: 'verified',
  label: 'Verified',
  tone: 'emerald',
  description: 'Basic contact and listing details passed manual checks.',
};
const OWNER_CLAIMED_STATE = {
  value: 'owner_claimed',
  label: 'Owner claimed',
  tone: 'sky',
  description: 'A business representative has claimed or requested control of this listing.',
};
const COMMUNITY_LISTED_STATE = {
  value: 'community_listed',
  label: 'Community listed',
  tone: 'slate',
  description: 'This listing was added from community or directory records and may need updates.',
};
const NEEDS_CONFIRMATION_STATE = {
  value: 'needs_confirmation',
  label: 'Needs confirmation',
  tone: 'amber',
  description: 'Public contact or location details still need confirmation.',
};
const RECENTLY_ADDED_STATE = {
  value: 'recently_added',
  label: 'Recently added',
  tone: 'amber',
  description: 'This listing was added recently and may still be reviewed or corrected.',
};
const REPORTED_ISSUE_STATE = {
  value: 'reported_issue',
  label: 'Reported issue',
  tone: 'rose',
  description: 'A possible issue has been reported and should be checked before relying on details.',
};
const ADMIN_REVIEWED_STATE = {
  value: 'admin_reviewed',
  label: 'Admin reviewed',
  tone: 'blue',
  description: 'A directory admin has reviewed the listing, but this is not a service endorsement.',
};
const PUBLIC_LOCALITY_STATUSES = new Set(['harbour_view_verified', 'harbour_view_likely']);

export const TRUST_FILTERS = [
  { value: '', label: 'All trust states' },
  { value: 'verified', label: 'Verified' },
  { value: 'owner_claimed', label: 'Owner claimed' },
  { value: 'community_listed', label: 'Community listed' },
  { value: 'needs_confirmation', label: 'Needs confirmation' },
  { value: 'recently_added', label: 'Recently added' },
  { value: 'reported_issue', label: 'Reported issue' },
  { value: 'admin_reviewed', label: 'Admin reviewed' },
];

function ageInDays(dateValue) {
  if (!dateValue) return Infinity;
  return (Date.now() - new Date(dateValue).getTime()) / (1000 * 60 * 60 * 24);
}

function normalizedStatus(vendor = {}) {
  return (vendor.verification_status || vendor.data_quality_status || '').toString().toLowerCase();
}

function hasContact(vendor = {}) {
  return Boolean(
    vendor.phone?.toString().trim() ||
    vendor.whatsapp?.toString().trim() ||
    vendor.website?.toString().trim()
  );
}

function hasPlausibleArea(vendor = {}) {
  return Boolean(vendor.address || vendor.area || PUBLIC_LOCALITY_STATUSES.has(vendor.locality_status));
}

function hasBasicIdentity(vendor = {}) {
  return Boolean(vendor.business_name && vendor.category);
}

function hasReportedIssueStatus(status = '') {
  return status.includes('issue') || status.includes('needs_review') || status.includes('flagged');
}

export function isTrulyVerifiedVendor(vendor = {}) {
  const status = normalizedStatus(vendor);
  const hasVerifiedSignal = vendor.is_verified === true || status === 'verified';
  return Boolean(
    hasVerifiedSignal &&
    hasContact(vendor) &&
    hasBasicIdentity(vendor) &&
    hasPlausibleArea(vendor) &&
    !hasReportedIssueStatus(status)
  );
}

export function getPublicTrustState(vendor = {}) {
  const status = normalizedStatus(vendor);
  const states = [];
  const isVerified = isTrulyVerifiedVendor(vendor);
  const missingContact = !hasContact(vendor);
  const needsConfirmation = missingContact || !hasPlausibleArea(vendor) || !hasBasicIdentity(vendor);
  const hasReportedIssue = hasReportedIssueStatus(status);
  const isRecentlyAdded = ageInDays(vendor.created_at) <= RECENT_DAYS;
  const isOwnerClaimed = vendor.owner_claimed === true || vendor.claimed_at || vendor.owner_id;
  const isAdminReviewed = status === 'admin_reviewed' || status === 'approved' || vendor.is_featured || vendor.is_top_ad;

  if (isVerified) {
    states.push(VERIFIED_STATE);
    if (isOwnerClaimed) states.push(OWNER_CLAIMED_STATE);
    if (isAdminReviewed) states.push(ADMIN_REVIEWED_STATE);
  } else if (hasReportedIssue) {
    states.push(REPORTED_ISSUE_STATE);
  } else if (needsConfirmation) {
    states.push(NEEDS_CONFIRMATION_STATE);
    if (isRecentlyAdded) states.push(RECENTLY_ADDED_STATE);
  } else if (isOwnerClaimed) {
    states.push(OWNER_CLAIMED_STATE);
    if (isAdminReviewed) states.push(ADMIN_REVIEWED_STATE);
    if (isRecentlyAdded) states.push(RECENTLY_ADDED_STATE);
  } else if (isAdminReviewed) {
    states.push(ADMIN_REVIEWED_STATE);
    if (isRecentlyAdded) states.push(RECENTLY_ADDED_STATE);
  } else if (isRecentlyAdded) {
    states.push(RECENTLY_ADDED_STATE);
    states.push(COMMUNITY_LISTED_STATE);
  } else {
    states.push(COMMUNITY_LISTED_STATE);
  }

  const seen = new Set();
  const uniqueStates = states.filter((state) => {
    if (seen.has(state.value)) return false;
    seen.add(state.value);
    return true;
  });

  return {
    primary: uniqueStates[0] || COMMUNITY_LISTED_STATE,
    secondary: uniqueStates.slice(1),
    states: uniqueStates,
    isVerified,
    showContactNotice: missingContact && !isVerified,
  };
}

export function getTrustStatus(vendor = {}) {
  return getPublicTrustState(vendor);
}

export function getTrustStates(vendor = {}) {
  return getPublicTrustState(vendor).states;
}

export function getPrimaryTrustState(vendor = {}) {
  return getPublicTrustState(vendor).primary;
}

export function vendorMatchesTrustState(vendor = {}, filterValue = '') {
  if (!filterValue) return true;
  return getTrustStates(vendor).some(state => state.value === filterValue);
}

export function getTrustBadgeClass(tone = 'slate') {
  const classes = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    sky: 'bg-sky-50 text-sky-700 ring-sky-200',
    blue: 'bg-blue-50 text-blue-700 ring-blue-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return classes[tone] || classes.slate;
}

export function getTrustStateDescription(stateOrValue = '') {
  const value = typeof stateOrValue === 'string' ? stateOrValue : stateOrValue?.value;
  const state = [
    VERIFIED_STATE,
    OWNER_CLAIMED_STATE,
    COMMUNITY_LISTED_STATE,
    NEEDS_CONFIRMATION_STATE,
    RECENTLY_ADDED_STATE,
    REPORTED_ISSUE_STATE,
    ADMIN_REVIEWED_STATE,
  ].find(item => item.value === value);

  return state?.description || 'This public trust label reflects available directory data.';
}
