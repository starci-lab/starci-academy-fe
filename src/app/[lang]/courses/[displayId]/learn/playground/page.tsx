import { CoursePlaygroundPage } from "@/components/pages/CoursePlaygroundPage"

type PlaygroundRouteProps = { readonly params: Promise<{ displayId: string }> }

/** Mount the canonical live playground catalog. */
const PlaygroundPage = async (input: PlaygroundRouteProps) => {
    const { displayId } = await input.params
    return <CoursePlaygroundPage displayId={displayId} />
}

export default PlaygroundPage
