export type Option = { value: string; label: string }

const same = (labels: string[]): Option[] => labels.map((l) => ({ value: l, label: l }))

export const CATEGORIES = same([
  'AI / LLMs',
  'AI Agents',
  'Coding Tools',
  'Search / SEO / Agentic Search',
  'Cloud',
  'Kubernetes / Infrastructure',
  'Security / IAM',
  'Observability',
  'Data / Analytics',
  'ML Infrastructure',
  'CI/CD / DevOps',
  'Developer Tools',
  'Enterprise Software',
  'Hardware',
  'Other',
])

export const COMPARISON_TYPES: Option[] = [
  { value: 'compare-multiple', label: 'Compare multiple products/tools' },
  { value: 'single', label: 'Test a single product/tool' },
  { value: 'approach', label: 'Test a technology or approach without a specific vendor' },
  { value: 'unsure', label: 'Not sure' },
]

export const METRIC_OTHER = 'Other'
export const METRICS = same([
  'Accuracy / quality',
  'Success / task completion rate',
  'Cost',
  'Speed / latency',
  'Reliability',
  'Failure rate',
  'Human effort / intervention required',
  'Ease of use',
  'Setup complexity',
  'Maintenance effort',
  'Security / privacy',
  'Performance',
  'Scalability',
  METRIC_OTHER,
])

export const PAID_OPTIONS: Option[] = [
  { value: 'no', label: 'No — free access should be sufficient' },
  { value: 'yes', label: 'Yes — definitely' },
  { value: 'possibly', label: "Possibly — I'm not sure" },
  { value: 'unknown', label: "I don't know" },
]

export const CURRENCIES: Option[] = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'BDT', label: 'BDT' },
  { value: 'OTHER', label: 'Other' },
]

export const COST_TYPES = same([
  'Monthly subscription',
  'Annual subscription',
  'One-time purchase',
  'API / usage-based cost',
  'Usage credits',
  'Dataset/license',
  'Hardware',
  'Cloud infrastructure',
  'Other',
])

export const DURATIONS: Option[] = [
  { value: 'lt-1-day', label: 'Less than 1 day' },
  { value: '1-7-days', label: '1–7 days' },
  { value: '1-4-weeks', label: '1–4 weeks' },
  { value: '1-3-months', label: '1–3 months' },
  { value: 'gt-3-months', label: 'More than 3 months' },
  { value: 'unsure', label: 'Not sure' },
]

export const EXISTING_ACCESS: Option[] = [
  { value: 'yes', label: 'Yes, I already have access' },
  { value: 'no', label: 'No, access would need to be purchased' },
  { value: 'partial', label: 'Partially — I have some access but additional usage may be needed' },
  { value: 'unsure', label: 'Not sure' },
]

export const SPONSOR_OPTIONS: Option[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'depends', label: 'Possibly, depending on the cost' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Not applicable' },
]

export const ROLES = same([
  'CTO / Technology Executive',
  'Engineering Leader',
  'Software Engineer',
  'Product Manager',
  'Researcher',
  'Founder',
  'Consultant',
  'Student',
  'Other',
])
