import { CourseLearnChallengePage } from "@/components/pages/CourseLearnChallengePage"

type ContentChallengeRouteProps = {
    readonly params: Promise<{
        readonly lang: string
        readonly displayId: string
        readonly moduleId: string
        readonly contentId: string
        readonly challengeId: string
    }>
}

/** Mounts the exact challenge nested under its owning content reader. */
const ContentChallengeRoute = async ({ params }: ContentChallengeRouteProps) => {
    const { displayId, moduleId, contentId, challengeId } = await params
    return (
        <CourseLearnChallengePage
            displayId={displayId}
            moduleId={moduleId}
            contentId={contentId}
            challengeId={challengeId}
        />
    )
}

export default ContentChallengeRoute
