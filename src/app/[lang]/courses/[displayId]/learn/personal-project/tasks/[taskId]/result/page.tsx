import { PersonalProjectTaskResultPage } from "./component"

interface ResultRouteProps { params: Promise<{ lang: string; displayId: string; taskId: string }> }

const ResultRoute = async ({ params }: ResultRouteProps) => {
    const { lang, displayId, taskId } = await params
    return <PersonalProjectTaskResultPage lang={lang} displayId={displayId} taskId={taskId} />
}

export default ResultRoute
