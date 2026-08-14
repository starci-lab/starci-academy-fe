import { CourseFlashcardSessionPage } from "@/components/pages/CourseFlashcardSessionPage"

interface FlashcardQuizSessionRouteProps {
    readonly params: Promise<{ readonly displayId: string; readonly sessionId: string }>
}

/** Mounts one resumable quiz session at its stable legacy URL. */
const FlashcardQuizSessionRoute = async ({ params }: FlashcardQuizSessionRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseFlashcardSessionPage displayId={displayId} sessionId={sessionId} mode="quiz" />
}

export default FlashcardQuizSessionRoute
