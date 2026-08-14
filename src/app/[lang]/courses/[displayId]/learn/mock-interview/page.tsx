import { CourseMockInterviewSetupPage } from "@/components/pages/CourseMockInterviewSetupPage"

interface MockInterviewRouteProps {
    params: Promise<{ displayId: string }>
}

const MockInterviewRoute = async ({ params }: MockInterviewRouteProps) => (
    <CourseMockInterviewSetupPage displayId={(await params).displayId} />
)

export default MockInterviewRoute
