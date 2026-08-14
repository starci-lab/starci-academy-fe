import { CourseFlashcardsQuizPage } from "@/components/pages/CourseFlashcardsQuizPage"

interface FlashcardsQuizRouteProps {
    readonly params: Promise<{ readonly displayId: string }>
}

/** Mounts the connected quiz setup without route-local product drawing. */
const FlashcardsQuizRoute = async ({ params }: FlashcardsQuizRouteProps) => {
    const { displayId } = await params
    return <CourseFlashcardsQuizPage displayId={displayId} />
}

export default FlashcardsQuizRoute
