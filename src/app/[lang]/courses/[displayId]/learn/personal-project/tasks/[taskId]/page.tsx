import { CoursePersonalProjectTaskPage } from "@/components/pages/CoursePersonalProjectTaskPage"

interface TaskRouteProps { params: Promise<{ displayId: string; taskId: string }> }

const TaskRoute = async ({ params }: TaskRouteProps) => {
    const { displayId, taskId } = await params
    return <CoursePersonalProjectTaskPage displayId={displayId} taskId={taskId} />
}

export default TaskRoute
