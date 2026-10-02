import { defaultValues, type FormValues } from '../lib/schema'
import { toStoredRequest } from '../lib/mapRequest'
import { matchesPaidFilter, formatCost } from '../lib/triage'

const base = {
  ...defaultValues,
  experimentTitle: 'Agents on a real codebase',
  coreQuestion: 'Which agent fixes the most regressions on the same repo?',
  whyWorthTesting: 'Claims are unverified.',
  categories: ['AI Agents'],
  comparisonType: 'compare-multiple',
  realWorldScenario: 'Same repo, same bugs.',
  metrics: ['Cost'],
  requiresPaidResources: 'no',
  requesterName: 'Ada',
  requesterEmail: 'ada@example.com',
  contactPermission: true,
} as FormValues

describe('toStoredRequest', () => {
  it('derives triage fields and drops cost fields when nothing is paid', () => {
    const r = toStoredRequest({ ...base, estimatedCostAmount: '50', paidResources: 'Cursor Pro' }, new Date('2026-01-01T00:00:00Z'), 'id-1')
    expect(r).toMatchObject({ id: 'id-1', status: 'new', paidExperiment: false, needsCostReview: false, createdAt: '2026-01-01T00:00:00.000Z' })
    expect(r.estimatedCostAmount).toBeUndefined()
    expect(r.paidResources).toBeUndefined()
  })

  it('flags "yes" as paid and "possibly" as needing review', () => {
    const paid = { ...base, estimatedCostAmount: '120', estimatedCostCurrency: 'EUR', paidResources: 'Cursor Pro', costTypes: ['Monthly subscription'] }
    const yes = toStoredRequest({ ...paid, requiresPaidResources: 'yes' })
    const maybe = toStoredRequest({ ...paid, requiresPaidResources: 'possibly' })
    expect(yes).toMatchObject({ paidExperiment: true, needsCostReview: false, estimatedCostAmount: 120, estimatedCostCurrency: 'EUR' })
    expect(maybe).toMatchObject({ paidExperiment: false, needsCostReview: true })
  })

  it('splits technologies on commas and new lines', () => {
    expect(toStoredRequest({ ...base, technologies: 'Claude Code, Cursor\nGitHub Copilot\n\n' }).technologies).toEqual(['Claude Code', 'Cursor', 'GitHub Copilot'])
  })
})

describe('triage helpers', () => {
  it('filters by the Paid experiment? control', () => {
    const yes = { paidExperiment: true, needsCostReview: false }
    const maybe = { paidExperiment: false, needsCostReview: true }
    const no = { paidExperiment: false, needsCostReview: false }
    expect([yes, maybe, no].map((r) => matchesPaidFilter(r, 'any'))).toEqual([true, true, true])
    expect([yes, maybe, no].map((r) => matchesPaidFilter(r, 'yes'))).toEqual([true, false, false])
    expect([yes, maybe, no].map((r) => matchesPaidFilter(r, 'review'))).toEqual([false, true, false])
    expect([yes, maybe, no].map((r) => matchesPaidFilter(r, 'no'))).toEqual([false, false, true])
  })

  it('formats cost safely', () => {
    expect(formatCost('250', 'USD')).toBe('$250')
    expect(formatCost('', 'USD')).toBe('—')
    expect(formatCost(undefined)).toBe('—')
  })
})
