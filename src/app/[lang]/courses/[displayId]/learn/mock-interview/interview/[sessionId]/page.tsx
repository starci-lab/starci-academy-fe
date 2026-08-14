import { MockInterviewPage } from "@/components/pages/MockInterviewPage"

interface MockInterviewSessionRouteProps {
    params: Promise<{ displayId: string; sessionId: string }>
}

const MockInterviewSessionRoute = async ({ params }: MockInterviewSessionRouteProps) => {
    const { displayId, sessionId } = await params
    return <MockInterviewPage displayId={displayId} sessionId={sessionId} />
}

export default MockInterviewSessionRoute
