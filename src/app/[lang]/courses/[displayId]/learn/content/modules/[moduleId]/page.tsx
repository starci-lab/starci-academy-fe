import { CourseLearnModulePage } from "@/components/pages/CourseLearnModulePage"

interface CourseLearnModuleRouteProps { params: Promise<{ moduleId: string }> }

const CourseLearnModuleRoute = async ({ params }: CourseLearnModuleRouteProps) => <CourseLearnModulePage moduleId={(await params).moduleId} />

export default CourseLearnModuleRoute
