import { useFormContext, useWatch } from 'react-hook-form'
import type { FormValues } from '../lib/schema'
import { formatCost, paidLabel } from '../lib/triage'
import type { PaidAnswer } from '../lib/types'

export const SECTIONS = [
  { id: 'idea', title: 'Experiment idea' },
  { id: 'tools', title: 'Tools & technology' },
  { id: 'scenario', title: 'Scenario & measures' },
  { id: 'cost', title: 'Paid access & cost' },
  { id: 'requester', title: 'About you' },
  { id: 'context', title: 'Extra context' },
]

/** Sticky side rail: section links plus a live preview of what a reviewer sees at a glance. */
export function TriageRail() {
  const { control } = useFormContext<FormValues>()
  const [paid, amount, currency, categories] = useWatch({
    control,
    name: ['requiresPaidResources', 'estimatedCostAmount', 'estimatedCostCurrency', 'categories'],
  })
  const showCost = paid === 'yes' || paid === 'possibly'

  return (
    <aside className="rail" aria-label="Form overview">
      <nav aria-label="Form sections">
        <ol>
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <span className="n">{i + 1}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="preview">
        <h2>What a reviewer sees first</h2>
        <dl>
          <div>
            <dt>Paid experiment</dt>
            <dd>
              <span className={`badge badge-${paid ?? 'none'} justify-center`}>
                {paid ? paidLabel[paid as PaidAnswer] : 'Not answered'}
              </span>
            </dd>
          </div>
          <div>
            <dt>Estimated cost</dt>
            <dd>{showCost ? formatCost(amount, currency) : '—'}</dd>
          </div>
          <div>
            <dt>Categories</dt>
            <dd>{categories?.length ? categories.length : '—'}</dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
