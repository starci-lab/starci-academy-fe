import { CoursePlaygroundSessionPage } from "@/components/pages/CoursePlaygroundSessionPage"

type PlaygroundSessionRouteProps = { readonly params: Promise<{ displayId: string; slug: string }> }

/** Mount the live session page inside the persistent slug layout. */
const PlaygroundSessionPage = async (input: PlaygroundSessionRouteProps) => {
    const { displayId, slug } = await input.params
    return <CoursePlaygroundSessionPage displayId={displayId} slug={slug} />
}

export default PlaygroundSessionPage
