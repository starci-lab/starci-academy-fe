import { CourseLearnModulePage } from "@/components/pages/CourseLearnModulePage"

interface CourseLearnModuleRouteProps { params: Promise<{ displayId: string, moduleId: string }> }

const CourseLearnModuleRoute = async ({ params }: CourseLearnModuleRouteProps) => {
    const { displayId, moduleId } = await params
    return <CourseLearnModulePage displayId={displayId} moduleId={moduleId} />
}

export default CourseLearnModuleRoute
