import { toStoredRequest } from '../lib/mapRequest'
import type { FormValues } from '../lib/schema'
import type { StoredExperimentRequest } from '../lib/types'

/**
 * BACKEND STUB
 * ------------
 * Replace the body of this function when the real API exists, or just set
 * VITE_EXPERIMENT_API_URL and the record is POSTed there as JSON.
 *
 * Until then: waits briefly, logs the record, and appends it to localStorage
 * under STUB_KEY so you can inspect what would be persisted.
 *
 * To see the error state manually, open the page with ?stub=fail
 */
export const STUB_KEY = 'ctaio.experimentRequests.stub'

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function submitExperimentRequest(values: FormValues): Promise<StoredExperimentRequest> {
  const record = toStoredRequest(values)
  const endpoint = import.meta.env.VITE_EXPERIMENT_API_URL as string | undefined

  if (endpoint) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
    return record
  }

  await wait(800)
  if (new URLSearchParams(window.location.search).get('stub') === 'fail') {
    throw new Error('Stub failure (?stub=fail)')
  }
  try {
    const existing = JSON.parse(localStorage.getItem(STUB_KEY) ?? '[]') as unknown[]
    localStorage.setItem(STUB_KEY, JSON.stringify([...existing, record]))
  } catch {
    /* storage unavailable — the stub still succeeds */
  }
  console.info('[stub] experiment request stored', record)
  return record
}
