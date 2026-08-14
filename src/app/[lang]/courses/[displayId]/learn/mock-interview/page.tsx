import { MockInterviewPage } from "@/components/pages/MockInterviewPage"

interface MockInterviewRouteProps {
    params: Promise<{ displayId: string }>
}

const MockInterviewRoute = async ({ params }: MockInterviewRouteProps) => (
    <MockInterviewPage displayId={(await params).displayId} />
)

export default MockInterviewRoute
