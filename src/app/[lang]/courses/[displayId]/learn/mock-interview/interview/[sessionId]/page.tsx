import { CourseMockInterviewSessionPage } from "@/components/pages/CourseMockInterviewSessionPage"

interface MockInterviewSessionRouteProps {
    params: Promise<{ displayId: string; sessionId: string }>
}

const MockInterviewSessionRoute = async ({ params }: MockInterviewSessionRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseMockInterviewSessionPage displayId={displayId} sessionId={sessionId} />
}

export default MockInterviewSessionRoute
