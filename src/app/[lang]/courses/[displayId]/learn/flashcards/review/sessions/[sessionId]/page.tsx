import { CourseFlashcardSessionPage } from "@/components/pages/CourseFlashcardSessionPage"

interface FlashcardReviewSessionRouteProps {
    readonly params: Promise<{ readonly displayId: string; readonly sessionId: string }>
}

/** Mounts one resumable deck or due-review session at its stable legacy URL. */
const FlashcardReviewSessionRoute = async ({ params }: FlashcardReviewSessionRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseFlashcardSessionPage displayId={displayId} sessionId={sessionId} mode="review" />
}

export default FlashcardReviewSessionRoute
