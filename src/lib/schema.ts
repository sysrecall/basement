import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'

export const MAX_COST = 100_000

const text = (max: number) =>
  z.string().trim().max(max, `Keep this under ${max.toLocaleString('en-US')} characters.`)

const required = (max: number, message: string) => text(max).min(1, message)

const oneOf = (message: string) => ({ errorMap: () => ({ message }) })

export const baseSchema = z.object({
    // 1 — idea
    experimentTitle: z
      .string()
      .trim()
      .min(10, 'Use at least 10 characters.')
      .max(150, 'Keep the title under 150 characters.'),
    coreQuestion: z
      .string()
      .trim()
      .min(30, 'Use at least 30 characters so the question is specific enough to test.')
      .max(2000, 'Keep this under 2,000 characters.'),
    whyWorthTesting: required(3000, 'Tell us why this is worth testing.'),
    expectedOutcome: text(2000),

    // 2 — technology
    categories: z.array(z.string()).min(1, 'Choose at least one category.'),
    technologies: text(2000),
    comparisonType: z.enum(['compare-multiple', 'single', 'approach', 'unsure'], oneOf('Choose one option.')),

    // 3 — scenario
    realWorldScenario: required(4000, 'Describe what we should actually test.'),
    metrics: z.array(z.string()).min(1, 'Choose at least one thing to measure.'),
    customMetric: text(200),
    methodologyNotes: text(3000),

    // 4 — cost
    requiresPaidResources: z.enum(['no', 'yes', 'possibly', 'unknown'], oneOf('Choose one option.')),
    paidResources: text(2000),
    estimatedCostAmount: z.string().trim(),
    estimatedCostCurrency: z.string(),
    costTypes: z.array(z.string()),
    paidAccessDuration: z.string(),
    existingAccess: z.string(),
    willingToSponsor: z.string(),

    // 5 — requester
    requesterName: required(120, 'Enter your name.'),
    requesterEmail: z
      .string()
      .trim()
      .min(1, 'Enter your email address.')
      .email('Enter a valid email address, like name@company.com.'),
    organization: text(200),
    role: z.string(),

    // 6 — context
    references: text(3000),
    additionalContext: text(3000),

    // consent
    contactPermission: z.boolean().refine((v) => v === true, {
      message: 'Please confirm we may contact you about this request.',
    }),
})

export type FormValues = z.infer<typeof baseSchema>

type FieldMessages = Partial<Record<keyof FormValues, string>>

/**
 * Cross-field rules for the paid-resource questions. Kept outside the Zod object
 * because Zod skips object-level refinements while any other field is invalid,
 * which would hide these errors until everything else was fixed.
 */
export function costIssues(v: FormValues): FieldMessages {
  const out: FieldMessages = {}
  if (v.requiresPaidResources !== 'yes' && v.requiresPaidResources !== 'possibly') return out

  if (!v.paidResources?.trim()) out.paidResources = 'List the paid resources you expect this would need.'

  const raw = (v.estimatedCostAmount ?? '').trim()
  const amount = Number(raw)
  if (raw === '') out.estimatedCostAmount = 'Enter an approximate amount.'
  else if (!Number.isFinite(amount)) out.estimatedCostAmount = 'Enter the amount as a number.'
  else if (amount < 0) out.estimatedCostAmount = "Cost can't be negative. Use 0 if there is no cost."
  else if (amount > MAX_COST) out.estimatedCostAmount = `Cost can't exceed ${MAX_COST.toLocaleString('en-US')}.`

  if (!v.costTypes?.length) out.costTypes = 'Choose at least one cost type.'
  if (!v.paidAccessDuration) out.paidAccessDuration = 'Choose how long access would be needed.'
  if (!v.existingAccess) out.existingAccess = 'Tell us whether you already have access.'
  return out
}

const zodResolverBase = zodResolver(baseSchema)

/** react-hook-form resolver: Zod field rules + cost cross-field rules, reported together. */
export const resolver: Resolver<FormValues> = async (values, context, options) => {
  const result = await zodResolverBase(values, context, options)
  const extra = Object.entries(costIssues(values as FormValues)).map(([name, message]) => [
    name,
    { type: 'custom', message },
  ])
  if (extra.length === 0) return result
  return { values: {}, errors: { ...(result.errors as object), ...Object.fromEntries(extra) } } as never
}

export const defaultValues: Partial<FormValues> = {
  experimentTitle: '',
  coreQuestion: '',
  whyWorthTesting: '',
  expectedOutcome: '',
  categories: [],
  technologies: '',
  realWorldScenario: '',
  metrics: [],
  customMetric: '',
  methodologyNotes: '',
  paidResources: '',
  estimatedCostAmount: '',
  estimatedCostCurrency: 'USD',
  costTypes: [],
  paidAccessDuration: '',
  existingAccess: '',
  willingToSponsor: '',
  requesterName: '',
  requesterEmail: '',
  organization: '',
  role: '',
  references: '',
  additionalContext: '',
  contactPermission: false,
}
