import { CourseLearnContentHomePage } from "@/components/pages/CourseLearnContentHomePage"

interface CourseLearnContentHomeRouteProps { params: Promise<{ displayId: string }> }

const CourseLearnContentHomeRoute = async ({ params }: CourseLearnContentHomeRouteProps) => <CourseLearnContentHomePage displayId={(await params).displayId} />

export default CourseLearnContentHomeRoute
