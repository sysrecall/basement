import { useId, type ReactNode } from 'react'
import { Controller, useFormContext, useWatch, type FieldError } from 'react-hook-form'
import type { FormValues } from '../lib/schema'
import type { Option } from '../lib/options'

type Name = keyof FormValues

function useError(name: Name) {
  const {
    formState: { errors },
  } = useFormContext<FormValues>()
  return (errors[name] as FieldError | undefined)?.message
}

const describe = (id: string, help?: ReactNode, error?: string) =>
  [help ? `${id}-help` : null, error ? `${id}-err` : null].filter(Boolean).join(' ') || undefined

function Head({ id, label, optional, help, legend }: { id: string; label: string; optional?: boolean; help?: ReactNode; legend?: boolean }) {
  const Label = legend ? 'legend' : 'label'
  return (
    <>
      <div className="field-head">
        <Label className="label" {...(legend ? {} : { htmlFor: id })}>
          {label}
        </Label>
        {optional && <span className="tag">Optional</span>}
      </div>
      {help && (
        <p id={`${id}-help`} className="help">
          {help}
        </p>
      )}
    </>
  )
}

function Foot({ id, error, counter }: { id: string; error?: string; counter?: ReactNode }) {
  return (
    <div className="field-foot">
      <p id={`${id}-err`} className="error" aria-live="polite">
        {error}
      </p>
      {counter}
    </div>
  )
}

/* ---------- text, textarea, email, number ---------- */

type TextProps = {
  name: Name
  label: string
  help?: ReactNode
  optional?: boolean
  placeholder?: string
  type?: string
  multiline?: boolean
  rows?: number
  max?: number
  autoComplete?: string
}

export function TextField({ name, label, help, optional, placeholder, type = 'text', multiline, rows = 4, max, autoComplete }: TextProps) {
  const id = useId()
  const { register } = useFormContext<FormValues>()
  const error = useError(name)
  const value = useWatch<FormValues>({ name }) as string | undefined
  const len = (value ?? '').length

  const shared = {
    id,
    placeholder,
    autoComplete,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describe(id, help, error),
    ...register(name as never),
  }

  return (
    <div className="field">
      <Head id={id} label={label} optional={optional} help={help} />
      {multiline ? <textarea rows={rows} {...shared} /> : <input type={type} {...shared} />}
      <Foot
        id={id}
        error={error}
        counter={
          max ? (
            <span className={`counter${len > max ? ' over' : len > max * 0.9 ? ' near' : ''}`}>
              {len.toLocaleString('en-US')} / {max.toLocaleString('en-US')}
            </span>
          ) : undefined
        }
      />
    </div>
  )
}

/* ---------- select ---------- */

export function SelectField({ name, label, options, help, optional, placeholder = 'Select…' }: { name: Name; label: string; options: Option[]; help?: ReactNode; optional?: boolean; placeholder?: string }) {
  const id = useId()
  const { register } = useFormContext<FormValues>()
  const error = useError(name)
  return (
    <div className="field">
      <Head id={id} label={label} optional={optional} help={help} />
      <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describe(id, help, error)} {...register(name as never)}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Foot id={id} error={error} />
    </div>
  )
}

/* ---------- radio group ---------- */

type ChoiceProps = {
  name: Name
  label: string
  options: Option[]
  help?: ReactNode
  optional?: boolean
  columns?: 1 | 2
}

export function RadioField({ name, label, options, help, optional, columns = 1 }: ChoiceProps) {
  const id = useId()
  const { control } = useFormContext<FormValues>()
  const error = useError(name)
  return (
    <fieldset className="field" aria-describedby={describe(id, help, error)}>
      <Head id={id} label={label} optional={optional} help={help} legend />
      <Controller
        control={control}
        name={name as never}
        render={({ field }) => (
          <div className={`choices cols-${columns}`}>
            {options.map((o, i) => (
              <label className="choice" key={o.value}>
                <input
                  type="radio"
                  name={field.name}
                  value={o.value}
                  checked={field.value === o.value}
                  onChange={() => field.onChange(o.value)}
                  onBlur={field.onBlur}
                  ref={i === 0 ? field.ref : undefined}
                  aria-invalid={error ? true : undefined}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        )}
      />
      <Foot id={id} error={error} />
    </fieldset>
  )
}

/* ---------- checkbox group ---------- */

export function CheckboxGroup({ name, label, options, help, optional, columns = 2 }: ChoiceProps) {
  const id = useId()
  const { control } = useFormContext<FormValues>()
  const error = useError(name)
  return (
    <fieldset className="field" aria-describedby={describe(id, help, error)}>
      <Head id={id} label={label} optional={optional} help={help} legend />
      <Controller
        control={control}
        name={name as never}
        render={({ field }) => {
          const selected = (field.value as string[] | undefined) ?? []
          return (
            <div className={`choices cols-${columns}`}>
              {options.map((o, i) => (
                <label className="choice" key={o.value}>
                  <input
                    type="checkbox"
                    value={o.value}
                    checked={selected.includes(o.value)}
                    onChange={(e) =>
                      field.onChange(e.target.checked ? [...selected, o.value] : selected.filter((x) => x !== o.value))
                    }
                    onBlur={field.onBlur}
                    ref={i === 0 ? field.ref : undefined}
                    aria-invalid={error ? true : undefined}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          )
        }}
      />
      <Foot id={id} error={error} />
    </fieldset>
  )
}

/* ---------- single checkbox (consent) ---------- */

export function ConsentField({ name, children }: { name: Name; children: ReactNode }) {
  const id = useId()
  const { register } = useFormContext<FormValues>()
  const error = useError(name)
  return (
    <div className="field">
      <label className="choice consent" htmlFor={id}>
        <input id={id} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={describe(id, undefined, error)} {...register(name as never)} />
        <span>{children}</span>
      </label>
      <Foot id={id} error={error} />
    </div>
  )
}

/* ---------- amount + currency ---------- */

export function AmountField({ currencies }: { currencies: Option[] }) {
  const id = useId()
  const { register } = useFormContext<FormValues>()
  const error = useError('estimatedCostAmount')
  const help = 'An approximate estimate is enough.'
  return (
    <div className="field">
      <Head id={id} label="Estimated total experiment cost" help={help} />
      <div className="amount-row">
        <select aria-label="Currency" {...register('estimatedCostCurrency')}>
          {currencies.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={100000}
          step="any"
          placeholder="0"
          aria-invalid={error ? true : undefined}
          aria-describedby={describe(id, help, error)}
          {...register('estimatedCostAmount')}
        />
      </div>
      <Foot id={id} error={error} />
    </div>
  )
}
