import { ExperimentRequestForm } from '../components/ExperimentRequestForm'
import { submitExperimentRequest } from '../api/experimentRequests'

export function RequestAnExperiment() {
  return (
    <div className="page">
      <header className="topbar">
        <a href="https://ctaio.dev/en/labs" className="wordmark">
          CTAIO Labs
        </a>
      </header>

      <main>
        <div className="masthead">
          <h1>Request an Experiment</h1>
          <p className="lede">
            Have a technology question you would like us to test in the real world? Suggest an experiment. The more specific and testable the question, the better.
          </p>
          <p className="note">We may contact you for clarification before deciding whether to run the experiment.</p>
        </div>

        <ExperimentRequestForm onSubmit={submitExperimentRequest} />
      </main>
    </div>
  )
}
