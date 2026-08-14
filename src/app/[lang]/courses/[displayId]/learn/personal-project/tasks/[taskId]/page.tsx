import { PersonalProjectTaskPage } from "./component"

interface TaskRouteProps { params: Promise<{ lang: string; displayId: string; taskId: string }> }

const TaskRoute = async ({ params }: TaskRouteProps) => {
    const { lang, displayId, taskId } = await params
    return <PersonalProjectTaskPage lang={lang} displayId={displayId} taskId={taskId} />
}

export default TaskRoute
