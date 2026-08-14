import { CoursePersonalProjectPage } from "@/components/pages/CoursePersonalProjectPage"

interface PersonalProjectRouteProps { params: Promise<{ displayId: string }> }

const PersonalProjectRoute = async ({ params }: PersonalProjectRouteProps) => {
    const { displayId } = await params
    return <CoursePersonalProjectPage displayId={displayId} />
}

export default PersonalProjectRoute
