import { CoursePersonalProjectResultPage } from "@/components/pages/CoursePersonalProjectResultPage"

interface ResultRouteProps { params: Promise<{ displayId: string; taskId: string }> }

const ResultRoute = async ({ params }: ResultRouteProps) => {
    const { displayId, taskId } = await params
    return <CoursePersonalProjectResultPage displayId={displayId} taskId={taskId} />
}

export default ResultRoute
