"use client"

import { gql } from "@apollo/client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"

type Deck = {
    id: string
    title: string
    description: string
    difficulty: string
    cards: ReadonlyArray<{ id: string }>
}

type Copy = {
    title: string
    subtitle: string
    study: string
    quiz: string
    due: string
    dueDescription: string
    review: string
    allCaught: string
    stats: string
    streak: string
    retention: string
    decks: string
    cards: string
    start: string
    retry: string
    empty: string
    error: string
}

const copy = (lang: string): Copy => lang === "vi" ? {
    title: "Flashcard",
    subtitle: "Ôn tập theo nhịp nhớ để ghi nhớ lâu hơn.",
    study: "Ôn tập",
    quiz: "Trắc nghiệm",
    due: "Hôm nay cần ôn",
    dueDescription: "Chọn một bộ thẻ để bắt đầu phiên ôn tập.",
    review: "Ôn thẻ",
    allCaught: "Bạn đã ôn hết thẻ hôm nay.",
    stats: "Tiến độ ôn tập",
    streak: "ngày liên tiếp",
    retention: "tỷ lệ nhớ đúng",
    decks: "Bộ thẻ",
    cards: "thẻ",
    start: "Bắt đầu",
    retry: "Thử lại",
    empty: "Khóa học này chưa có bộ flashcard.",
    error: "Không thể tải flashcard.",
} : {
    title: "Flashcards",
    subtitle: "Review with spaced repetition to remember longer.",
    study: "Review",
    quiz: "Quiz",
    due: "Due today",
    dueDescription: "Choose a deck to start a review session.",
    review: "Review cards",
    allCaught: "You are all caught up for today.",
    stats: "Review progress",
    streak: "day streak",
    retention: "retention",
    decks: "Decks",
    cards: "cards",
    start: "Start",
    retry: "Retry",
    empty: "This course has no flashcard decks yet.",
    error: "Flashcards could not be loaded.",
}

const decksQuery = gql`
    query FlashcardDecksByCourse($courseId: ID!) {
        flashcardDecksByCourse(courseId: $courseId) {
            success
            data { id title description difficulty cards { id } }
        }
    }
`

const statsQuery = gql`
    query MyFlashcardStats {
        myFlashcardStats {
            success
            data { currentStreak retentionRate totalReviewed }
        }
    }
`

type FlashcardResponse = { flashcardDecksByCourse?: { data?: Deck[] | null } }
type Stats = { currentStreak: number, retentionRate: number, totalReviewed: number }
type StatsResponse = { myFlashcardStats?: { data?: Stats | null } }

export const FlashcardsSurface = ({ lang, displayId, mode = "study" }: { lang: string, displayId: string, mode?: "study" | "quiz" }) => {
    const router = useRouter()
    const labels = copy(lang)
    const [decks, setDecks] = useState<Deck[]>([])
    const [stats, setStats] = useState<Stats | undefined>()
    const [state, setState] = useState<"pending" | "ready" | "failed">("pending")

    const load = async () => {
        setState("pending")
        try {
            const apollo = createApolloClient({ withAuth: true })
            const course = await apollo.query<{ course?: { data?: { id: string } | null } }>({
                query: gql`query CourseFlashcards($request: CourseRequest!) { course(request: $request) { data { id } } }`,
                variables: { request: { displayId } },
            })
            const courseId = course.data?.course?.data?.id
            if (!courseId) throw new Error("Course not found")
            const [deckResult, statsResult] = await Promise.all([
                apollo.query<FlashcardResponse>({ query: decksQuery, variables: { courseId } }),
                apollo.query<StatsResponse>({ query: statsQuery }),
            ])
            setDecks(deckResult.data?.flashcardDecksByCourse?.data ?? [])
            setStats(statsResult.data?.myFlashcardStats?.data ?? undefined)
            setState("ready")
        } catch {
            setState("failed")
        }
    }

    useEffect(() => { void load() }, [displayId])

    const statLine = useMemo(() => stats
        ? `${stats.currentStreak} ${labels.streak} · ${stats.retentionRate}% ${labels.retention}`
        : "—", [labels.retention, labels.streak, stats])

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 @app-sm:px-6">
            <header className="flex flex-col gap-2">
                <p className="text-sm text-muted">{labels.title}</p>
                <h1 className="text-2xl font-semibold tracking-tight">{labels.title}</h1>
                <p className="text-sm text-muted">{labels.subtitle}</p>
            </header>

            <nav aria-label={labels.title} className="flex gap-2 border-b border-default pb-2">
                <button type="button" className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "study" ? "bg-accent text-accent-foreground" : "text-muted"}`} onClick={() => router.push(`/${lang}/courses/${displayId}/learn/flashcards/review`)}>{labels.study}</button>
                <button type="button" className={`rounded-lg px-3 py-2 text-sm font-medium ${mode === "quiz" ? "bg-accent text-accent-foreground" : "text-muted"}`} onClick={() => router.push(`/${lang}/courses/${displayId}/learn/flashcards/quiz`)}>{labels.quiz}</button>
            </nav>

            {mode === "quiz" ? (
                <section className="rounded-xl border border-default bg-surface p-5">
                    <h2 className="text-lg font-semibold">{labels.quiz}</h2>
                    <p className="mt-2 text-sm text-muted">{labels.dueDescription}</p>
                    <button type="button" className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={() => router.push(`/${lang}/courses/${displayId}/learn/flashcards/review`)}>{labels.review}</button>
                </section>
            ) : (
                <>
                    <section className="rounded-xl border border-default bg-surface p-5">
                        <p className="text-sm font-semibold">{labels.due}</p>
                        {state === "pending" ? <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-default-200" /> : state === "failed" ? <div className="mt-3 flex items-center justify-between gap-4"><p className="text-sm text-danger">{labels.error}</p><button type="button" className="text-sm font-medium underline" onClick={() => void load()}>{labels.retry}</button></div> : <p className="mt-2 text-sm text-muted">{decks.length ? labels.dueDescription : labels.allCaught}</p>}
                    </section>
                    <section className="rounded-xl border border-default bg-surface p-5">
                        <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold">{labels.stats}</h2><p className="text-sm text-muted">{statLine}</p></div>
                    </section>
                    <section className="flex flex-col gap-4">
                        <h2 className="text-lg font-semibold">{labels.decks}</h2>
                        {state === "ready" && decks.length === 0 ? <p className="rounded-xl border border-dashed border-default p-5 text-sm text-muted">{labels.empty}</p> : <div className="grid gap-4 @app-sm:grid-cols-2">{decks.map((deck) => <article key={deck.id} className="flex flex-col gap-3 rounded-xl border border-default bg-surface p-5"><div><h3 className="font-semibold">{deck.title}</h3><p className="mt-1 text-sm text-muted">{deck.description}</p></div><div className="mt-auto flex items-center justify-between gap-3"><span className="text-xs text-muted">{deck.cards.length} {labels.cards} · {deck.difficulty}</span><button type="button" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={() => router.push(`/${lang}/courses/${displayId}/learn/flashcards/review?deck=${deck.id}`)}>{labels.start}</button></div></article>)}</div>}
                    </section>
                </>
            )}
        </main>
    )
}
