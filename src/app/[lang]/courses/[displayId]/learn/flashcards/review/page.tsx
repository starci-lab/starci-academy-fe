import { CourseFlashcardsReviewPage } from "@/components/pages/CourseFlashcardsReviewPage"

interface FlashcardsReviewRouteProps {
    readonly params: Promise<{ readonly displayId: string }>
}

/** Mounts the connected review overview without route-local product drawing. */
const FlashcardsReviewRoute = async ({ params }: FlashcardsReviewRouteProps) => {
    const { displayId } = await params
    return <CourseFlashcardsReviewPage displayId={displayId} />
}

export default FlashcardsReviewRoute
