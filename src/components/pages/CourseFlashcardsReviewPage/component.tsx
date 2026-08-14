import { Heading } from "@/components/leaves/Heading"

/** One settled deck row rendered by the review overview. */
export type FlashcardReviewDeckRow = {
    readonly id: string
    readonly title: string
    readonly description: string
    readonly difficulty: string
    readonly cardCount: number
    readonly dueCount: number
    readonly masteredCount: number
}

/** Pure review-overview contract after all live values and actions resolve. */
export type CourseFlashcardsReviewPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly subtitle: string
        readonly reviewLabel: string
        readonly quizLabel: string
        readonly dueTitle: string
        readonly dueDescription: string
        readonly statsTitle: string
        readonly streakText: string
        readonly retentionText: string
        readonly decksTitle: string
        readonly cardsLabel: string
        readonly dueLabel: string
        readonly masteredLabel: string
        readonly startLabel: string
        readonly resumeLabel: string
        readonly retryLabel: string
        readonly emptyText: string
        readonly failedText: string
        readonly dueCount: number
        readonly decks: ReadonlyArray<FlashcardReviewDeckRow>
        readonly resumeSessionId?: string
    }
    readonly on: {
        readonly openQuiz: () => void
        readonly startDue: () => void
        readonly startDeck: (deckId: string) => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}

/** Renders the legacy review hierarchy without fetching or routing internally. */
export const _CourseFlashcardsReviewPage = (input: CourseFlashcardsReviewPageProps) => {
    const state = input.state
    const data = input.props
    const on = input.on
    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 @app-sm:px-6">
            <header className="flex flex-col gap-2">
                <Heading props={{ content: data.title, level: 1 }} />
                <p className="text-sm text-muted">{data.subtitle}</p>
            </header>
            <nav aria-label={data.title} className="flex gap-2 border-b border-default pb-2">
                <span aria-current="page" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">{data.reviewLabel}</span>
                <button type="button" className="rounded-lg px-3 py-2 text-sm font-medium text-muted" onClick={on.openQuiz}>{data.quizLabel}</button>
            </nav>
            {state === "pending" ? (
                <section aria-label={data.decksTitle} className="grid gap-4 @app-sm:grid-cols-2">
                    {[0, 1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-default-200" />)}
                </section>
            ) : state === "failed" ? (
                <section className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-danger">{data.failedText}</p>
                    <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{data.retryLabel}</button>
                </section>
            ) : state === "empty" ? (
                <p className="rounded-xl border border-dashed border-default p-5 text-sm text-muted">{data.emptyText}</p>
            ) : (
                <>
                    <section className="rounded-xl border border-default bg-surface p-5">
                        <Heading props={{ content: data.dueTitle, level: 2 }} />
                        <p className="mt-2 text-sm text-muted">{data.dueDescription}</p>
                        <p className="mt-2 text-sm font-medium">{data.dueCount} {data.dueLabel}</p>
                        {data.resumeSessionId === undefined ? (
                            data.dueCount === 0 ? null : (
                                <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.startDue}>{data.startLabel}</button>
                            )
                        ) : (
                            <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={() => on.resume(data.resumeSessionId ?? "")}>{data.resumeLabel}</button>
                        )}
                    </section>
                    <section className="rounded-xl border border-default bg-surface p-5">
                        <Heading props={{ content: data.statsTitle, level: 2 }} />
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
                            <span>{data.streakText}</span>
                            <span>{data.retentionText}</span>
                        </div>
                    </section>
                    <section className="flex flex-col gap-4">
                        <Heading props={{ content: data.decksTitle, level: 2 }} />
                        <div className="grid gap-4 @app-sm:grid-cols-2">
                            {data.decks.map((deck) => (
                                <article key={deck.id} className="flex flex-col gap-3 rounded-xl border border-default bg-surface p-5">
                                    <div>
                                        <Heading props={{ content: deck.title, level: 3 }} />
                                        <p className="mt-1 text-sm text-muted">{deck.description}</p>
                                    </div>
                                    <p className="text-xs text-muted">{deck.cardCount} {data.cardsLabel} · {deck.dueCount} {data.dueLabel} · {deck.masteredCount} {data.masteredLabel}</p>
                                    <button type="button" className="mt-auto rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={() => on.startDeck(deck.id)}>{data.startLabel}</button>
                                </article>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
