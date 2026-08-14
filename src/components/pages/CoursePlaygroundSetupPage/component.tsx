import type { Playground } from "@/modules/api/graphql/queries/query-playground"

/** Setup and agent-pairing states exposed by the pure setup page. */
export type CoursePlaygroundSetupState = "loading" | "unpaired" | "paired" | "ready" | "starting" | "failed"

/** Resolved playground, pairing copy and setup actions. */
export type CoursePlaygroundSetupPageProps = {
    readonly state: CoursePlaygroundSetupState
    readonly props: {
        readonly playground?: Playground | null
        readonly titleFallback: string
        readonly preparationTitle: string
        readonly preparationSteps: ReadonlyArray<string>
        readonly startLabel: string
        readonly startingLabel: string
        readonly pairingLabel: string
        readonly waitingLabel: string
        readonly readyLabel: string
        readonly enterLabel: string
        readonly retryLabel: string
        readonly failedText: string
        readonly pairingCode?: string
    }
    readonly on: {
        readonly start: () => void
        readonly enter: () => void
        readonly retry: () => void
    }
}

/** Draw setup and pairing as states of one server-created playground session. */
export const _CoursePlaygroundSetupPage = ({ state, props, on }: CoursePlaygroundSetupPageProps) => {
    const loading = state === "loading"
    return (
        <section data-tier="page" data-component="CoursePlaygroundSetupPage" className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 @app-sm:px-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{props.playground?.title ?? props.titleFallback}</h1>
                <p className="text-sm text-muted">{props.playground?.description ?? ""}</p>
            </header>
            {loading ? <div className="h-72 animate-pulse rounded-xl bg-default-200" /> : state === "failed" ? (
                <div className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-danger">{props.failedText}</p>
                    <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{props.retryLabel}</button>
                </div>
            ) : (
                <div className="flex flex-col gap-5 rounded-xl border border-default bg-surface p-5">
                    <h2 className="text-lg font-semibold">{props.preparationTitle}</h2>
                    <ol className="flex flex-col gap-3">
                        {props.preparationSteps.map((step, index) => (
                            <li key={step} className="flex items-center gap-3 rounded-lg bg-default-100 p-3 text-sm">
                                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent font-medium text-accent-foreground">{index + 1}</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                    {state === "unpaired" || state === "starting" ? (
                        <button type="button" disabled={state === "starting"} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-60" onClick={on.start}>
                            {state === "starting" ? props.startingLabel : props.startLabel}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3 rounded-lg border border-default p-4">
                            <p className="text-xs uppercase tracking-wide text-muted">{props.pairingLabel}</p>
                            <code className="break-all rounded-lg bg-default-100 p-3 font-mono text-sm">{props.pairingCode}</code>
                            <p className="text-sm text-muted">{state === "ready" ? props.readyLabel : props.waitingLabel}</p>
                            <button type="button" disabled={state !== "ready"} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50" onClick={on.enter}>{props.enterLabel}</button>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
