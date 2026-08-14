import { CourseFlashcardResultPage } from "@/components/pages/CourseFlashcardResultPage"

interface FlashcardQuizResultRouteProps {
    readonly params: Promise<{ readonly displayId: string; readonly sessionId: string }>
}

/** Mounts the persisted result for one quick-quiz session. */
const FlashcardQuizResultRoute = async ({ params }: FlashcardQuizResultRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseFlashcardResultPage displayId={displayId} sessionId={sessionId} mode="quiz" />
}

export default FlashcardQuizResultRoute
