# CTAIO Labs - Request an Experiment

Vite + React + TypeScript frontend for the public `/request` form.
**The backend is a stub** - see `src/api/experimentRequests.ts`.

```bash
npm install
npm run dev        # http://localhost:5173/request
npm test           # vitest (validation, conditional fields, submit, failure, duplicate-submit)
npm run build      # typecheck + production build
```

Try the error state locally: `/request?stub=fail`.
Submitted records land in `localStorage["ctaio.experimentRequests.stub"]`.

## Backend design (planned)
```mermaid
flowchart TD
    subgraph INTAKE["1. Intake"]
        A["Requester fills /request form"] --> B["POST /api/experiment-requests"]
        B --> C{"Server-side Zod validation"}
        C -- invalid --> A
        C -- valid --> D[("Requests DB<br/>status = new<br/>paidExperiment, needsCostReview")]
        D --> E["Confirmation shown to requester"]
    end

    subgraph TRIAGE["2. Triage and prioritisation"]
        D --> F["Scoring job"]
        F --> G["Factors: paid, estimated cost, existing tools and subscriptions, access or sponsor, human intervention needed, difficulty"]
        G --> H{"Auto-triage"}
        H -- "missing or unclear" --> I["status = needs-info<br/>one-time clarification email"]
        I -- "requester replies" --> F
        H -- "clearly out of scope or duplicate" --> J["status = rejected"]
        H -- "viable" --> K["status = reviewing"]
        K --> L{"Editor review<br/>scope, cost approval"}
        L -- reject --> J
        L -- approve --> M[["Priority queue<br/>status = accepted"]]
    end

    subgraph EXEC["3. Agent execution"]
        M --> N["Scheduler picks next job"]
        N --> O{"Required tools and<br/>credentials available?"}
        O -- no --> P["Blocked: needs budget,<br/>subscription or human setup"]
        P -- "resolved by us or sponsor" --> M
        O -- yes --> Q["Provision sandbox<br/>VM or container from base image"]
        R[("Environment catalog<br/>pre-installed tools, APIs,<br/>secrets vault, spend caps")] --> Q
        Q --> S["Agent plans experiment from<br/>scenario, metrics and methodology notes"]
        S --> T["Agent runs the experiment<br/>logs, outputs, raw data saved"]
        T --> U{"Run succeeded?"}
        U -- "retry within limits" --> S
        U -- "failed or needs a human" --> P
        U -- yes --> V["Extract requested metrics<br/>cost, latency, success rate, etc."]
    end

    subgraph PUBLISH["4. Report, review and publish"]
        V --> W["Generate report draft<br/>methodology, results, costs, code"]
        W --> X{"Human review (us)"}
        X -- "changes requested" --> S
        X -- reject --> Y["status = rejected or archived"]
        X -- approve --> Z["Publish lab article<br/>and/or podcast episode"]
        Z --> AA["status = completed<br/>notify requester"]
    end

    subgraph CROSS["Cross-cutting"]
        AB[("Spend tracker and audit log")]
        AC[("Artifact storage<br/>logs, datasets, code")]
    end
    T -.-> AB
    Q -.-> AB
    T -.-> AC
    W -.-> AC
```

## Wiring the backend later

One function: `submitExperimentRequest(values)` in `src/api/experimentRequests.ts`.
Either set `VITE_EXPERIMENT_API_URL` (the form POSTs the stored record as JSON) or replace the body.
The record it sends is already the shape to persist (`StoredExperimentRequest` in `src/lib/types.ts`):
public fields + `status: "new"` + derived `paidExperiment` (`yes`) and `needsCostReview` (`possibly`).
Re-validate on the server; the client schema in `src/lib/schema.ts` is a good starting point.

## Layout

```
src/lib/options.ts      every option list (one place to edit copy)
src/lib/schema.ts       Zod field rules + costIssues() cross-field rules + RHF resolver
src/lib/mapRequest.ts   form values -> stored record (splits technologies, drops cost fields when unpaid, derives triage flags)
src/lib/triage.ts       "Paid experiment?" filter (any/no/yes/review) + cost formatting for a future admin list
src/components/         fields.tsx, TriageRail.tsx, ExperimentRequestForm.tsx
src/api/                backend stub
```

## Notes

- Hosting needs an SPA fallback so `/request` serves `index.html`.
- "Would you be willing to provide access or sponsor…" stays visible even when the answer to the
  paid question is "No", because the brief lists it as always-optional.
- The `CTAIO Labs` link in the top bar points to `https://ctaio.dev/en/labs`; adjust if that's not the real path.
