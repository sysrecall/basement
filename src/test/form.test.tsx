import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExperimentRequestForm } from '../components/ExperimentRequestForm'

type User = ReturnType<typeof userEvent.setup>

const setup = (onSubmit = vi.fn().mockResolvedValue(undefined)) => {
  render(<ExperimentRequestForm onSubmit={onSubmit} />)
  return { onSubmit, user: userEvent.setup() }
}

const change = (label: string | RegExp, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } })

const submitButton = () => screen.getByRole('button', { name: /Submit Experiment Request|Sending/ })

async function fillValid(user: User, paid: 'no' | 'yes' = 'no') {
  change('Experiment title', 'Can AI coding agents maintain a codebase?')
  change(/What question should the experiment answer/, 'Which coding agent fixes the most regressions on the same repository?')
  change(/Why is this experiment worth running/, 'Vendor claims are hard to verify independently.')
  await user.click(screen.getByLabelText('AI Agents'))
  await user.click(screen.getByLabelText('Test a single product/tool'))
  change(/What should we actually test/, 'Same repo, same bug list, same time limit.')
  await user.click(screen.getByLabelText('Cost'))
  await user.click(screen.getByLabelText(paid === 'no' ? /free access should be sufficient/ : /Yes — definitely/))
  change('Name', 'Ada Lovelace')
  change('Email', 'ada@example.com')
  await user.click(screen.getByLabelText(/You may contact me by email/))
}

describe('required-field validation', () => {
  it('blocks an empty submit and shows what is missing', async () => {
    const { onSubmit, user } = setup()
    await user.click(submitButton())

    expect(await screen.findByText('Use at least 10 characters.')).toBeInTheDocument()
    expect(screen.getByText(/Use at least 30 characters/)).toBeInTheDocument()
    expect(screen.getByText('Tell us why this is worth testing.')).toBeInTheDocument()
    expect(screen.getByText('Choose at least one category.')).toBeInTheDocument()
    expect(screen.getByText('Choose at least one thing to measure.')).toBeInTheDocument()
    expect(screen.getByText('Enter your name.')).toBeInTheDocument()
    expect(screen.getByText(/confirm we may contact you/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('enforces the title length limit', async () => {
    const { user } = setup()
    change('Experiment title', 'x'.repeat(151))
    await user.click(submitButton())
    expect(await screen.findByText('Keep the title under 150 characters.')).toBeInTheDocument()
  })
})

describe('email validation', () => {
  it('rejects a malformed address', async () => {
    const { onSubmit, user } = setup()
    await fillValid(user)
    change('Email', 'not-an-email')
    await user.click(submitButton())
    expect(await screen.findByText(/Enter a valid email address/)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('conditional paid-resource fields', () => {
  const paidQuestionYes = /Which paid subscriptions, APIs, credits/
  const paidQuestionPossibly = /Which APIs, datasets, hardware, or services would be required/
  const anyPaidQuestion = /would be required/

  it('is hidden until the answer is yes or possibly', async () => {
    const { user } = setup()
    expect(screen.queryByLabelText(anyPaidQuestion)).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/Yes — definitely/))
    expect(screen.getByLabelText(paidQuestionYes)).toBeInTheDocument()
    expect(screen.getByLabelText('Estimated total experiment cost')).toBeInTheDocument()
    expect(screen.getByLabelText('Expected duration of paid access')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Possibly — I'm not sure/))
    expect(screen.getByLabelText(paidQuestionPossibly)).toBeInTheDocument()
    expect(screen.queryByLabelText(paidQuestionYes)).not.toBeInTheDocument()
    expect(screen.getByLabelText('Estimated total experiment cost')).toBeInTheDocument()

    await user.click(screen.getByLabelText(/free access should be sufficient/))
    expect(screen.queryByLabelText(anyPaidQuestion)).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Estimated total experiment cost')).not.toBeInTheDocument()
  })

  it('hides the cost details for "I don\'t know" as well', async () => {
    const { user } = setup()
    await user.click(screen.getByLabelText(/Yes — definitely/))
    await user.click(screen.getByLabelText(/I don't know/))
    expect(screen.queryByLabelText(anyPaidQuestion)).not.toBeInTheDocument()
  })

  it('requires the cost details once they are shown', async () => {
    const { onSubmit, user } = setup()
    await fillValid(user, 'yes')
    await user.click(submitButton())
    expect(await screen.findByText(/List the paid resources/)).toBeInTheDocument()
    expect(screen.getByText('Enter an approximate amount.')).toBeInTheDocument()
    expect(screen.getByText('Choose at least one cost type.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('does not ask for cost details when the answer is "I don\'t know"', async () => {
    const { onSubmit, user } = setup()
    await fillValid(user)
    await user.click(screen.getByLabelText(/I don't know/))
    await user.click(submitButton())
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })

  it('shows the custom metric field only when "Other" is selected', async () => {
    const { user } = setup()
    expect(screen.queryByLabelText('Other metric')).not.toBeInTheDocument()
    const other = screen.getAllByLabelText('Other').find((el) => el.closest('#scenario'))!
    await user.click(other)
    expect(screen.getByLabelText('Other metric')).toBeInTheDocument()
  })
})

describe('cost validation', () => {
  it.each([
    ['-5', /can't be negative/],
    ['100001', /can't exceed 100,000/],
  ])('rejects %s', async (amount, message) => {
    const { onSubmit, user } = setup()
    await user.click(screen.getByLabelText(/Yes — definitely/))
    change('Estimated total experiment cost', amount)
    await user.click(submitButton())
    expect(await screen.findByText(message)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('accepts the boundaries 0 and 100000', async () => {
    const { user } = setup()
    await user.click(screen.getByLabelText(/Yes — definitely/))
    for (const amount of ['0', '100000']) {
      change('Estimated total experiment cost', amount)
      await user.click(submitButton())
      await screen.findByText('Choose at least one cost type.')
      expect(screen.queryByText(/can't be negative|can't exceed/)).not.toBeInTheDocument()
    }
  })
})

describe('submission', () => {
  it('submits valid answers and shows the success state', async () => {
    const { onSubmit, user } = setup()
    await fillValid(user)
    await user.click(submitButton())

    expect(await screen.findByRole('heading', { name: 'Experiment request received' })).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        experimentTitle: 'Can AI coding agents maintain a codebase?',
        categories: ['AI Agents'],
        comparisonType: 'single',
        metrics: ['Cost'],
        requiresPaidResources: 'no',
        requesterEmail: 'ada@example.com',
        contactPermission: true,
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Submit another request' }))
    expect(screen.getByLabelText('Experiment title')).toHaveValue('')
  })

  it('keeps the answers and shows an error when submission fails', async () => {
    const { user } = setup(vi.fn().mockRejectedValue(new Error('boom')))
    await fillValid(user)
    await user.click(submitButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't send your request/)
    expect(screen.queryByRole('heading', { name: 'Experiment request received' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('Experiment title')).toHaveValue('Can AI coding agents maintain a codebase?')
    await waitFor(() => expect(submitButton()).toBeEnabled())
  })

  it('prevents duplicate submissions while one is in flight', async () => {
    let finish!: () => void
    const pending = new Promise<void>((resolve) => (finish = resolve))
    const { onSubmit, user } = setup(vi.fn().mockReturnValue(pending))
    await fillValid(user)

    const form = submitButton().closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    fireEvent.submit(form)

    await waitFor(() => expect(submitButton()).toBeDisabled())
    expect(submitButton()).toHaveTextContent('Sending…')
    expect(onSubmit).toHaveBeenCalledTimes(1)

    finish()
    expect(await screen.findByRole('heading', { name: 'Experiment request received' })).toBeInTheDocument()
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
