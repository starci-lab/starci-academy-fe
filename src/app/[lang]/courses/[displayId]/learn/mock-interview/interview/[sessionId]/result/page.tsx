import { CourseMockInterviewResultPage } from "@/components/pages/CourseMockInterviewResultPage"

interface MockInterviewResultRouteProps {
    params: Promise<{ displayId: string; sessionId: string }>
}

const MockInterviewResultRoute = async ({ params }: MockInterviewResultRouteProps) => {
    const { displayId, sessionId } = await params
    return <CourseMockInterviewResultPage displayId={displayId} sessionId={sessionId} />
}

export default MockInterviewResultRoute
