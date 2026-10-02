export type PaidAnswer = 'no' | 'yes' | 'possibly' | 'unknown'

export type RequestStatus =
  | 'new'
  | 'reviewing'
  | 'needs-info'
  | 'accepted'
  | 'rejected'
  | 'completed'

type Level = 'low' | 'medium' | 'high'

/** What the requester submits. */
export type ExperimentRequest = {
  id: string

  experimentTitle: string
  coreQuestion: string
  whyWorthTesting: string
  expectedOutcome?: string

  categories: string[]
  technologies?: string[]
  comparisonType: string

  realWorldScenario: string
  metrics: string[]
  customMetric?: string
  methodologyNotes?: string

  requiresPaidResources: PaidAnswer
  paidResources?: string
  estimatedCostAmount?: number
  estimatedCostCurrency?: string
  costTypes?: string[]
  paidAccessDuration?: string
  existingAccess?: string
  willingToSponsor?: string

  requesterName: string
  requesterEmail: string
  organization?: string
  role?: string

  references?: string
  additionalContext?: string

  contactPermission: boolean

  createdAt: string
}

/** Internal-only fields. Never shown to the requester. */
export type InternalTriage = {
  status: RequestStatus
  priority?: Level
  estimatedDifficulty?: Level
  /** Derived: requiresPaidResources === "yes" */
  paidExperiment: boolean
  /** Derived: requiresPaidResources === "possibly" (needs a cost review) */
  needsCostReview: boolean
  internalNotes?: string
  assignedTo?: string
}

export type StoredExperimentRequest = ExperimentRequest & InternalTriage
