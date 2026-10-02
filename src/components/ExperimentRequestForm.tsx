import { useRef, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { defaultValues, resolver, type FormValues } from '../lib/schema'
import * as opt from '../lib/options'
import {
  AmountField,
  CheckboxGroup,
  ConsentField,
  RadioField,
  SelectField,
  TextField,
} from './fields'
import { TriageRail } from './TriageRail'

type Props = {
  /** Throw / reject to signal failure. Resolve to signal success. */
  onSubmit: (values: FormValues) => Promise<unknown>
}

function Section({ id, title, intro, children, variant }: { id: string; title: string; intro?: string; children: ReactNode; variant?: 'cost' }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`section${variant ? ` section-${variant}` : ''}`}>
      <h2 id={`${id}-title`}>{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
      {children}
    </section>
  )
}

function FormBody({ onSubmit, onSuccess }: { onSubmit: Props['onSubmit']; onSuccess: () => void }) {
  const methods = useForm<FormValues>({
    resolver,
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })
  const { handleSubmit, control } = methods
  const [serverError, setServerError] = useState(false)
  const [sending, setSending] = useState(false)
  const inFlight = useRef(false)

  const paid = useWatch({ control, name: 'requiresPaidResources' })
  const metrics = useWatch({ control, name: 'metrics' })
  const showCost = paid === 'yes' || paid === 'possibly'
  const showOther = metrics?.includes(opt.METRIC_OTHER)

  const submit = handleSubmit(async (values) => {
    if (inFlight.current) return // second submit while the first is pending
    inFlight.current = true
    setServerError(false)
    setSending(true)
    try {
      await onSubmit(values)
      onSuccess()
    } catch {
      setServerError(true)
    } finally {
      inFlight.current = false
      setSending(false)
    }
  })

  const busy = sending

  return (
    <FormProvider {...methods}>
      <div className="layout">
        <TriageRail />

        <form className="sheet" onSubmit={submit} noValidate aria-busy={busy}>
          <p className="legend-note">Everything is required unless marked optional.</p>

          <Section id="idea" title="Experiment idea">
            <TextField name="experimentTitle" label="Experiment title" max={150} placeholder="e.g. Can AI coding agents reliably maintain an existing production codebase?" />
            <TextField name="coreQuestion" label="What question should the experiment answer?" multiline rows={4} max={2000} help="Describe the specific question you want tested. Try to make it something that can be measured or compared." />
            <TextField name="whyWorthTesting" label="Why is this experiment worth running?" multiline rows={4} max={3000} help="Tell us what is unclear, over-hyped, poorly documented, disputed, or difficult to evaluate from existing information." />
            <TextField name="expectedOutcome" label="What would you like to learn from the result?" optional multiline rows={3} max={2000} help="For example: whether a tool is worth adopting, how much it costs, where it fails, how it compares with alternatives, or whether a vendor claim holds up in practice." />
          </Section>

          <Section id="tools" title="Tools & technology">
            <CheckboxGroup name="categories" label="Technology category" options={opt.CATEGORIES} columns={2} help="Choose all that apply." />
            <TextField name="technologies" label="What products, vendors, models, platforms, or technologies should be tested?" optional multiline rows={4} max={2000} help="List specific products where relevant. Separate multiple items with commas or new lines." placeholder={'Claude Code\nCursor\nGitHub Copilot\nWindsurf'} />
            <RadioField name="comparisonType" label="Is there a specific comparison?" options={opt.COMPARISON_TYPES} />
          </Section>

          <Section id="scenario" title="Scenario & measures">
            <TextField name="realWorldScenario" label="What should we actually test?" multiline rows={5} max={4000} help="Describe the real-world task, workflow, repository, dataset, environment, or scenario that should be used." placeholder="Give each coding agent the same existing repository and ask it to fix bugs, implement a feature, refactor code, and repair tests." />
            <CheckboxGroup name="metrics" label="What should be measured?" options={opt.METRICS} columns={2} help="Choose all that apply." />
            {showOther && (
              <div className="reveal">
                <TextField name="customMetric" label="Other metric" optional />
              </div>
            )}
            <TextField name="methodologyNotes" label="Anything else we should control or measure?" optional multiline rows={4} max={3000} help="Suggest test conditions, constraints, datasets, sample sizes, acceptance criteria, or other methodology ideas." />
          </Section>

          <Section
            id="cost"
            variant="cost"
            title="Paid subscriptions & experiment costs"
            intro="Some experiments require paid software, APIs, credits, datasets, hardware, or other resources. Tell us what you expect the experiment would require so we can assess the cost before deciding how to run it."
          >
            <RadioField name="requiresPaidResources" label="Would this experiment require paid products or services?" options={opt.PAID_OPTIONS} columns={2} />

            {showCost && (
              <div className="reveal" data-testid="paid-details">
                <TextField name="paidResources" label={
                  paid === 'possibly'
                    ? 'Which APIs, datasets, hardware, or services would be required?'
                    : 'Which paid subscriptions, APIs, credits, datasets, hardware, or services would be required?'
                } multiline rows={3} max={2000} placeholder={'Claude Pro\nCursor Pro\nOpenAI API credits\nElevenLabs subscription'} />
                <AmountField currencies={opt.CURRENCIES} />
                <CheckboxGroup name="costTypes" label="Cost type" options={opt.COST_TYPES} columns={2} help="Choose all that apply." />
                <SelectField name="paidAccessDuration" label="Expected duration of paid access" options={opt.DURATIONS} />
                <RadioField name="existingAccess" label="Do you already have access?" options={opt.EXISTING_ACCESS} />
              </div>
            )}

            <RadioField name="willingToSponsor" label="Would you be willing to provide access or sponsor the experiment?" optional options={opt.SPONSOR_OPTIONS} columns={2} help="This does not guarantee that the experiment will be accepted or that sponsorship will be requested." />
          </Section>

          <Section id="requester" title="About you">
            <div className="row">
              <TextField name="requesterName" label="Name" autoComplete="name" max={120} />
              <TextField name="requesterEmail" label="Email" type="email" autoComplete="email" />
            </div>
            <div className="row">
              <TextField name="organization" label="Company / organization" optional autoComplete="organization" />
              <SelectField name="role" label="Your role" options={opt.ROLES} optional />
            </div>
          </Section>

          <Section id="context" title="Extra context">
            <TextField name="references" label="Relevant links or references" optional multiline rows={4} max={3000} help="Add product pages, documentation, benchmarks, articles, vendor claims, GitHub repositories, or other material that helps explain the experiment." />
            <TextField name="additionalContext" label="Anything else we should know?" optional multiline rows={3} max={3000} />
            <ConsentField name="contactPermission">You may contact me by email about this experiment request if additional information is needed.</ConsentField>
          </Section>

          <div className="submit-bar">
            {serverError && (
              <p className="banner" role="alert">
                We couldn't send your request. Your answers are still here — check your connection and try again.
              </p>
            )}
            <button type="submit" className="primary" disabled={busy}>
              {busy && <span className="spinner" aria-hidden="true" />}
              {busy ? 'Sending…' : 'Submit Experiment Request'}
            </button>
          </div>
        </form>
      </div>
    </FormProvider>
  )
}

export function ExperimentRequestForm({ onSubmit }: Props) {
  const [done, setDone] = useState(false)
  const [round, setRound] = useState(0)

  if (done) {
    return (
      <div className="success" role="status">
        <h2 ref={(el) => el?.focus()} tabIndex={-1}>
          Experiment request received
        </h2>
        <p>Thanks for the suggestion. We've received your experiment request and will review the idea. We may contact you if we need additional information.</p>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            setDone(false)
            setRound((r) => r + 1)
          }}
        >
          Submit another request
        </button>
      </div>
    )
  }
  return <FormBody key={round} onSubmit={onSubmit} onSuccess={() => setDone(true)} />
}
