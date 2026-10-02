import type { FormValues } from './schema'
import type { StoredExperimentRequest } from './types'

const orUndefined = (s: string) => (s.trim() === '' ? undefined : s.trim())

export const splitList = (s: string) =>
  s
    .split(/[\n,]+/)
    .map((x) => x.trim())
    .filter(Boolean)

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `exp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Turns validated form values into the record the backend will store.
 * Cost fields are only kept when paid resources are "yes" or "possibly".
 */
export function toStoredRequest(
  v: FormValues,
  now: Date = new Date(),
  id: string = newId(),
): StoredExperimentRequest {
  const paid = v.requiresPaidResources === 'yes' || v.requiresPaidResources === 'possibly'
  const technologies = splitList(v.technologies)

  return {
    id,
    experimentTitle: v.experimentTitle,
    coreQuestion: v.coreQuestion,
    whyWorthTesting: v.whyWorthTesting,
    expectedOutcome: orUndefined(v.expectedOutcome ?? ''),

    categories: v.categories,
    technologies: technologies.length ? technologies : undefined,
    comparisonType: v.comparisonType,

    realWorldScenario: v.realWorldScenario,
    metrics: v.metrics,
    customMetric: v.metrics.includes('Other') ? orUndefined(v.customMetric) : undefined,
    methodologyNotes: orUndefined(v.methodologyNotes),

    requiresPaidResources: v.requiresPaidResources,
    paidResources: paid ? orUndefined(v.paidResources) : undefined,
    estimatedCostAmount: paid ? Number(v.estimatedCostAmount) : undefined,
    estimatedCostCurrency: paid ? v.estimatedCostCurrency : undefined,
    costTypes: paid ? v.costTypes : undefined,
    paidAccessDuration: paid ? orUndefined(v.paidAccessDuration) : undefined,
    existingAccess: paid ? orUndefined(v.existingAccess) : undefined,
    willingToSponsor: orUndefined(v.willingToSponsor),

    requesterName: v.requesterName,
    requesterEmail: v.requesterEmail,
    organization: orUndefined(v.organization),
    role: orUndefined(v.role),

    references: orUndefined(v.references),
    additionalContext: orUndefined(v.additionalContext),

    contactPermission: v.contactPermission,
    createdAt: now.toISOString(),

    status: 'new',
    paidExperiment: v.requiresPaidResources === 'yes',
    needsCostReview: v.requiresPaidResources === 'possibly',
  }
}
