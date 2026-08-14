import { CourseFlashcardResultPage } from "@/components/pages/CourseFlashcardResultPage"

interface FlashcardReviewResultRouteProps {
    readonly params: Promise<{ readonly displayId: string; readonly sessionId: string }>
}

/** Mounts the persisted result for one deck or due-review session. */
const FlashcardReviewResultRoute = async ({ params }: FlashcardReviewResultRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseFlashcardResultPage displayId={displayId} sessionId={sessionId} mode="review" />
}

export default FlashcardReviewResultRoute
