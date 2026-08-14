import { Heading } from "@/components/leaves/Heading"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** One resolved weak-topic row from a persisted result projection. */
export type CourseFlashcardResultWeakTopic = {
    readonly tag: string
    readonly value: string
}

/** Pure result input after its route-specific projection resolves. */
export type CourseFlashcardResultPageProps = {
    readonly state: "pending" | "ready" | "failed"
    readonly data: {
        readonly mode: FlashcardSessionMode
        readonly title: string
        readonly subtitle: string
        readonly scoreLabel: string
        readonly scoreText?: string
        readonly reviewedLabel: string
        readonly reviewedText?: string
        readonly xpLabel: string
        readonly xpText?: string
        readonly durationLabel: string
        readonly durationText?: string
        readonly nextDueLabel: string
        readonly nextDueText?: string
        readonly breakdownTitle: string
        readonly gradeRows: ReadonlyArray<{ readonly label: string; readonly value: number }>
        readonly weakTopicsTitle: string
        readonly weakTopics: ReadonlyArray<CourseFlashcardResultWeakTopic>
        readonly failedText: string
        readonly retryLabel: string
        readonly retrySessionLabel: string
        readonly backLabel: string
    }
    readonly on: {
        readonly retryLoad: () => void
        readonly retrySession: () => void
        readonly back: () => void
    }
}

/** Renders the stable review/quiz result URL with score, history, and onward actions. */
export const _CourseFlashcardResultPage = (input: CourseFlashcardResultPageProps) => {
    const { state, data, on } = input
    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 @app-sm:px-6">
            <header className="flex flex-col gap-2">
                <p className="text-sm text-muted">{data.mode === "review" ? "Review" : "Quiz"}</p>
                <Heading props={{ content: data.title, level: 1 }} />
                <p className="text-sm text-muted">{data.subtitle}</p>
            </header>
            {state === "pending" ? (
                <section aria-label={data.title} className="grid grid-cols-2 gap-4 @app-sm:grid-cols-4">
                    {[0, 1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-default-200" />)}
                </section>
            ) : state === "failed" ? (
                <section className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-danger">{data.failedText}</p>
                    <button type="button" className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={on.retryLoad}>{data.retryLabel}</button>
                </section>
            ) : (
                <>
                    <section className="grid grid-cols-2 gap-4 @app-sm:grid-cols-4">
                        {[
                            [data.scoreLabel, data.scoreText],
                            [data.reviewedLabel, data.reviewedText],
                            [data.xpLabel, data.xpText],
                            [data.durationLabel, data.durationText],
                        ].map(([label, value]) => (
                            <article key={label} className="rounded-xl border border-default bg-surface p-4">
                                <p className="text-xs text-muted">{label}</p>
                                <p className="mt-2 text-xl font-semibold">{value}</p>
                            </article>
                        ))}
                    </section>
                    {data.nextDueText === undefined ? null : (
                        <section className="rounded-xl border border-default bg-surface p-5">
                            <p className="text-sm text-muted">{data.nextDueLabel}</p>
                            <p className="mt-2 font-semibold">{data.nextDueText}</p>
                        </section>
                    )}
                    {data.gradeRows.length === 0 ? null : (
                        <section className="rounded-xl border border-default bg-surface p-5">
                            <Heading props={{ content: data.breakdownTitle, level: 2 }} />
                            <ul className="mt-4 grid grid-cols-2 gap-3 @app-sm:grid-cols-4">
                                {data.gradeRows.map((row) => <li key={row.label} className="rounded-lg bg-default-100 p-3 text-sm"><span>{row.label}</span><strong className="ml-2">{row.value}</strong></li>)}
                            </ul>
                        </section>
                    )}
                    {data.weakTopics.length === 0 ? null : (
                        <section className="rounded-xl border border-default bg-surface p-5">
                            <Heading props={{ content: data.weakTopicsTitle, level: 2 }} />
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {data.weakTopics.map((topic) => <li key={topic.tag} className="rounded-full bg-default-100 px-3 py-2 text-sm">{topic.tag} · {topic.value}</li>)}
                            </ul>
                        </section>
                    )}
                    <div className="flex flex-wrap justify-center gap-3">
                        <button type="button" className="rounded-lg border border-default px-4 py-2 text-sm font-medium" onClick={on.back}>{data.backLabel}</button>
                        <button type="button" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={on.retrySession}>{data.retrySessionLabel}</button>
                    </div>
                </>
            )}
        </main>
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
