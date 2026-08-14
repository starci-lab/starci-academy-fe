import { CoursePlaygroundSetupPage } from "@/components/pages/CoursePlaygroundSetupPage"

type PlaygroundPrepareRouteProps = { readonly params: Promise<{ displayId: string; slug: string }> }

/** Mount setup for one backend-resolved playground slug. */
const PlaygroundPreparePage = async (input: PlaygroundPrepareRouteProps) => {
    const { displayId, slug } = await input.params
    return <CoursePlaygroundSetupPage displayId={displayId} slug={slug} />
}

export default PlaygroundPreparePage
