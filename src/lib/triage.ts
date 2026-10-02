import type { PaidAnswer, StoredExperimentRequest } from './types'

/** Filter values for the admin "Paid experiment?" control. */
export type PaidFilter = 'any' | 'no' | 'yes' | 'review'

export function matchesPaidFilter(
  r: Pick<StoredExperimentRequest, 'paidExperiment' | 'needsCostReview'>,
  filter: PaidFilter,
): boolean {
  switch (filter) {
    case 'any':
      return true
    case 'yes':
      return r.paidExperiment
    case 'review':
      return r.needsCostReview
    case 'no':
      return !r.paidExperiment && !r.needsCostReview
  }
}

export function formatCost(amount: number | undefined | string, currency = 'USD'): string {
  const n = typeof amount === 'string' ? (amount.trim() === '' ? NaN : Number(amount)) : amount
  if (n === undefined || !Number.isFinite(n)) return '—'
  if (currency === 'OTHER') return `${n.toLocaleString('en-US')} (other currency)`
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
  } catch {
    return `${n.toLocaleString('en-US')} ${currency}`
  }
}

export const paidLabel: Record<PaidAnswer, string> = {
  no: 'No',
  yes: 'Yes',
  possibly: 'Needs cost review',
  unknown: 'Unknown',
}
