import { CourseLearnChallengeResultPage } from "@/components/pages/CourseLearnChallengeResultPage"

type ContentChallengeResultRouteProps = {
    readonly params: Promise<{
        readonly lang: string
        readonly displayId: string
        readonly moduleId: string
        readonly contentId: string
        readonly challengeId: string
    }>
}

/** Mounts the exact challenge result beneath its solve route. */
const ContentChallengeResultRoute = async ({ params }: ContentChallengeResultRouteProps) => {
    const { displayId, moduleId, contentId, challengeId } = await params
    return (
        <CourseLearnChallengeResultPage
            displayId={displayId}
            moduleId={moduleId}
            contentId={contentId}
            challengeId={challengeId}
        />
    )
}

export default ContentChallengeResultRoute
