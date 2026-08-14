import type { PlaygroundStep } from "@/modules/api/graphql/queries/query-playground"

/** Live relay states exposed by the pure playground workspace. */
export type CoursePlaygroundSessionState = "connecting" | "live" | "reconnecting" | "completed" | "failed"

/** Resolved session steps, progress and owner actions. */
export type CoursePlaygroundSessionPageProps = {
    readonly state: CoursePlaygroundSessionState
    readonly props: {
        readonly title: string
        readonly steps: ReadonlyArray<PlaygroundStep>
        readonly selectedStepIndex: number
        readonly passedStepIndexes: ReadonlyArray<number>
        readonly connectionText: string
        readonly submitLabel: string
        readonly leaveLabel: string
        readonly retryLabel: string
        readonly completedTitle: string
        readonly completedText: string
        readonly failedText: string
        readonly stepLabel: string
    }
    readonly on: {
        readonly step: (index: number) => void
        readonly submit: () => void
        readonly leave: () => void
        readonly retry: () => void
    }
}

/** Draw a live playground whose progress advances only from server `step:verified` events. */
export const _CoursePlaygroundSessionPage = ({ state, props, on }: CoursePlaygroundSessionPageProps) => {
    const current = props.steps[props.selectedStepIndex]
    return (
        <section data-tier="page" data-component="CoursePlaygroundSessionPage" data-state={state} className="grid min-h-[calc(100dvh-4rem)] w-full @app-lg:grid-cols-[17rem_1fr]">
            <aside className="border-b border-default bg-surface p-4 @app-lg:border-b-0 @app-lg:border-r">
                <button type="button" className="text-sm text-accent" onClick={on.leave}>{props.leaveLabel}</button>
                <h1 className="mt-5 font-semibold">{props.title}</h1>
                <ol className="mt-4 flex gap-2 overflow-x-auto @app-lg:flex-col @app-lg:overflow-visible">
                    {props.steps.map((step, index) => {
                        const passed = props.passedStepIndexes.includes(index)
                        const available = passed || index <= Math.max(0, props.passedStepIndexes.length)
                        return (
                            <li key={step.id}>
                                <button
                                    type="button"
                                    disabled={!available}
                                    aria-current={index === props.selectedStepIndex ? "step" : undefined}
                                    className="w-full min-w-40 rounded-lg px-3 py-2 text-left text-sm disabled:opacity-40 aria-[current=step]:bg-default-200"
                                    onClick={() => on.step(index)}
                                >
                                    <span className="font-medium">{props.stepLabel} {index + 1}</span>
                                    <span className="mt-1 block truncate text-xs text-muted">{passed ? "Passed: " : ""}{step.title}</span>
                                </button>
                            </li>
                        )
                    })}
                </ol>
            </aside>
            <div className="flex min-w-0 flex-col gap-6 p-4 @app-sm:p-6">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-default pb-4">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted">{props.connectionText}</p>
                        <h2 className="mt-1 text-xl font-semibold">{current?.title ?? props.title}</h2>
                    </div>
                    <button type="button" className="rounded-lg border border-default px-3 py-2 text-sm" onClick={on.leave}>{props.leaveLabel}</button>
                </header>
                {state === "failed" ? (
                    <div className="rounded-xl border border-default bg-surface p-5">
                        <p className="text-sm text-danger">{props.failedText}</p>
                        <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{props.retryLabel}</button>
                    </div>
                ) : state === "completed" ? (
                    <div className="rounded-xl border border-success bg-success-soft p-6">
                        <h2 className="text-lg font-semibold text-success-soft-foreground">{props.completedTitle}</h2>
                        <p className="mt-2 text-sm text-success-soft-foreground">{props.completedText}</p>
                    </div>
                ) : (
                    <>
                        <article className="flex flex-col gap-4 rounded-xl border border-default bg-surface p-5">
                            <p className="whitespace-pre-wrap text-sm leading-6">{current?.body ?? ""}</p>
                            {current?.commandHint === null || current?.commandHint === undefined ? null : <pre className="overflow-x-auto rounded-lg bg-[#101318] p-4 text-sm text-green-300"><code>{current.commandHint}</code></pre>}
                            {current?.actionHint === null || current?.actionHint === undefined ? null : <p className="rounded-lg bg-default-100 p-3 text-sm">{current.actionHint}</p>}
                        </article>
                        <button
                            type="button"
                            disabled={state !== "live" || current === undefined || props.passedStepIndexes.includes(props.selectedStepIndex)}
                            className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
                            onClick={on.submit}
                        >
                            {props.submitLabel}
                        </button>
                    </>
                )}
            </div>
        </section>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
