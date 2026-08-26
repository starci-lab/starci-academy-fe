import { CourseFlashcardsQuizPage } from "@/components/pages/CourseFlashcardsQuizPage"

interface FlashcardsQuizRouteProps {
    readonly params: Promise<{ readonly displayId: string }>
    readonly searchParams: Promise<{ readonly deckId?: string }>
}

/** Mounts the connected quiz setup without route-local product drawing. */
const FlashcardsQuizRoute = async ({ params, searchParams }: FlashcardsQuizRouteProps) => {
    const { displayId } = await params
    const { deckId } = await searchParams
    return <CourseFlashcardsQuizPage displayId={displayId} deckId={deckId} />
}

export default FlashcardsQuizRoute
