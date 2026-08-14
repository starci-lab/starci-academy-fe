import { Heading } from "@/components/leaves/Heading"
import type { FlashcardSessionMode } from "@/modules/api/graphql/queries/query-my-in-progress-flashcard-session"

/** Pure live-session states frozen by the approved A3 review. */
export type CourseFlashcardSessionState = "pending" | "active" | "syncing" | "completing" | "expired" | "failed"

/** Resolved display values for one focused review or quiz card. */
export type CourseFlashcardSessionPageData = {
    readonly mode: FlashcardSessionMode
    readonly title: string
    readonly progressText: string
    readonly deckTitle?: string
    readonly level?: string | null
    readonly prompt?: string
    readonly answer?: string
    readonly answerVisible: boolean
    readonly revealLabel: string
    readonly againLabel: string
    readonly hardLabel: string
    readonly goodLabel: string
    readonly easyLabel: string
    readonly correctLabel: string
    readonly incorrectLabel: string
    readonly syncingLabel: string
    readonly completingLabel: string
    readonly expiredText: string
    readonly failedText: string
    readonly retryLabel: string
    readonly leaveLabel: string
}

/** Resolved actions owned by the connected live-session page. */
export type CourseFlashcardSessionPageActions = {
    readonly reveal: () => void
    readonly rate: (grade: 0 | 1 | 2 | 3) => void
    readonly answerQuiz: (correct: boolean) => void
    readonly retry: () => void
    readonly leave: () => void
}

/** Pure live-session input after backend state and locale copy resolve. */
export type CourseFlashcardSessionPageProps = {
    readonly state: CourseFlashcardSessionState
    readonly data: CourseFlashcardSessionPageData
    readonly on: CourseFlashcardSessionPageActions
}

/** Renders one focused review/quiz card and its finite lifecycle controls. */
export const _CourseFlashcardSessionPage = (input: CourseFlashcardSessionPageProps) => {
    const { state, data, on } = input
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6 @app-sm:px-6">
            <header className="flex items-center justify-between gap-4 border-b border-default pb-4">
                <div>
                    <p className="text-sm text-muted">{data.deckTitle}</p>
                    <Heading props={{ content: data.title, level: 1 }} />
                </div>
                <button type="button" className="rounded-lg border border-default px-3 py-2 text-sm font-medium" onClick={on.leave}>{data.leaveLabel}</button>
            </header>
            {state === "pending" ? (
                <section aria-label={data.title} className="flex flex-1 flex-col gap-4 rounded-2xl border border-default bg-surface p-6">
                    <div className="h-4 w-28 animate-pulse rounded bg-default-200" />
                    <div className="h-28 animate-pulse rounded-xl bg-default-200" />
                </section>
            ) : state === "failed" || state === "expired" ? (
                <section className="rounded-2xl border border-default bg-surface p-6">
                    <p className="text-sm text-danger">{state === "expired" ? data.expiredText : data.failedText}</p>
                    <button type="button" className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{data.retryLabel}</button>
                </section>
            ) : (
                <section className="flex flex-1 flex-col gap-6 rounded-2xl border border-default bg-surface p-6">
                    <div className="flex items-center justify-between gap-4 text-sm text-muted">
                        <span>{data.progressText}</span>
                        <span>{data.level}</span>
                    </div>
                    <article className="flex min-h-48 flex-1 flex-col justify-center gap-5 rounded-xl border border-default bg-background p-6">
                        <p className="whitespace-pre-wrap text-lg font-medium">{data.prompt}</p>
                        {data.answerVisible ? <p className="whitespace-pre-wrap border-t border-default pt-5 text-sm text-muted">{data.answer}</p> : null}
                    </article>
                    {state === "syncing" || state === "completing" ? (
                        <p role="status" className="text-center text-sm text-muted">{state === "syncing" ? data.syncingLabel : data.completingLabel}</p>
                    ) : !data.answerVisible ? (
                        <button type="button" className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground" onClick={on.reveal}>{data.revealLabel}</button>
                    ) : data.mode === "review" ? (
                        <div className="grid grid-cols-2 gap-3 @app-sm:grid-cols-4">
                            {([data.againLabel, data.hardLabel, data.goodLabel, data.easyLabel] as const).map((label, grade) => (
                                <button key={label} type="button" className="rounded-lg border border-default px-3 py-3 text-sm font-medium" onClick={() => on.rate(grade as 0 | 1 | 2 | 3)}>{label}</button>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="rounded-lg border border-default px-3 py-3 text-sm font-medium" onClick={() => on.answerQuiz(false)}>{data.incorrectLabel}</button>
                            <button type="button" className="rounded-lg bg-accent px-3 py-3 text-sm font-medium text-accent-foreground" onClick={() => on.answerQuiz(true)}>{data.correctLabel}</button>
                        </div>
                    )}
                </section>
            )}
        </main>
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
