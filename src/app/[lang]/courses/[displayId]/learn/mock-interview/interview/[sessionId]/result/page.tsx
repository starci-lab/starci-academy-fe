import { MockInterviewPage } from "@/components/pages/MockInterviewPage"

interface MockInterviewResultRouteProps {
    params: Promise<{ displayId: string; sessionId: string }>
}

const MockInterviewResultRoute = async ({ params }: MockInterviewResultRouteProps) => {
    const { displayId, sessionId } = await params
    return <MockInterviewPage displayId={displayId} resultSessionId={sessionId} />
}

export default MockInterviewResultRoute
