import { Heading } from "@/components/leaves/Heading"

/** Pure quiz-setup contract after configuration facts and actions resolve. */
export type CourseFlashcardsQuizPageProps = {
    readonly state: "pending" | "ready" | "empty" | "failed"
    readonly props: {
        readonly title: string
        readonly subtitle: string
        readonly reviewLabel: string
        readonly quizLabel: string
        readonly configurationTitle: string
        readonly modeLabel: string
        readonly quickLabel: string
        readonly deepLabel: string
        readonly levelLabel: string
        readonly allLevelsLabel: string
        readonly juniorLabel: string
        readonly middleLabel: string
        readonly seniorLabel: string
        readonly staffLabel: string
        readonly startLabel: string
        readonly resumeLabel: string
        readonly retryLabel: string
        readonly emptyText: string
        readonly failedText: string
        readonly selectedMode: "quick" | "deep"
        readonly selectedLevel: string | null
        readonly cardCount: number
        readonly cardsLabel: string
        readonly resumeSessionId?: string
    }
    readonly on: {
        readonly openReview: () => void
        readonly selectMode: (mode: "quick" | "deep") => void
        readonly selectLevel: (level: string | null) => void
        readonly start: () => void
        readonly resume: (sessionId: string) => void
        readonly retry: () => void
    }
}

/** Renders the legacy quiz setup hierarchy without fetching or routing internally. */
export const _CourseFlashcardsQuizPage = (input: CourseFlashcardsQuizPageProps) => {
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
                <button type="button" className="rounded-lg px-3 py-2 text-sm font-medium text-muted" onClick={on.openReview}>{data.reviewLabel}</button>
                <span aria-current="page" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">{data.quizLabel}</span>
            </nav>
            {state === "pending" ? <div className="h-56 animate-pulse rounded-xl bg-default-200" /> : state === "failed" ? (
                <section className="rounded-xl border border-default bg-surface p-5">
                    <p className="text-sm text-danger">{data.failedText}</p>
                    <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{data.retryLabel}</button>
                </section>
            ) : state === "empty" ? <p className="rounded-xl border border-dashed border-default p-5 text-sm text-muted">{data.emptyText}</p> : (
                <section className="flex flex-col gap-6 rounded-xl border border-default bg-surface p-5">
                    <div>
                        <Heading props={{ content: data.configurationTitle, level: 2 }} />
                        <p className="mt-1 text-sm text-muted">{data.cardCount} {data.cardsLabel}</p>
                    </div>
                    {data.resumeSessionId === undefined ? null : <button type="button" className="rounded-lg border border-default px-4 py-2 text-sm font-medium" onClick={() => on.resume(data.resumeSessionId ?? "")}>{data.resumeLabel}</button>}
                    <fieldset className="flex flex-col gap-3">
                        <legend className="text-sm font-semibold">{data.modeLabel}</legend>
                        <div className="flex flex-wrap gap-2">
                            {(["quick", "deep"] as const).map((mode) => <button key={mode} type="button" aria-pressed={data.selectedMode === mode} className={`rounded-lg px-3 py-2 text-sm ${data.selectedMode === mode ? "bg-accent text-accent-foreground" : "border border-default"}`} onClick={() => on.selectMode(mode)}>{mode === "quick" ? data.quickLabel : data.deepLabel}</button>)}
                        </div>
                    </fieldset>
                    <fieldset className="flex flex-col gap-3">
                        <legend className="text-sm font-semibold">{data.levelLabel}</legend>
                        <div className="flex flex-wrap gap-2">
                            {([{ id: null, label: data.allLevelsLabel }, { id: "junior", label: data.juniorLabel }, { id: "middle", label: data.middleLabel }, { id: "senior", label: data.seniorLabel }, { id: "staff", label: data.staffLabel }] as const).map((level) => <button key={level.id ?? "all"} type="button" aria-pressed={data.selectedLevel === level.id} className={`rounded-lg px-3 py-2 text-sm ${data.selectedLevel === level.id ? "bg-accent text-accent-foreground" : "border border-default"}`} onClick={() => on.selectLevel(level.id)}>{level.label}</button>)}
                        </div>
                    </fieldset>
                    <button type="button" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={on.start}>{data.startLabel}</button>
                </section>
            )}
        </main>
    )
}

/** Canon metadata for the pure page half. */
export const meta = { world: "pure", domain: "learn" } as const
