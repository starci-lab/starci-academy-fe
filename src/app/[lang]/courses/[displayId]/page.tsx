import { CourseDetailPage } from "@/components/pages/CourseDetailPage"

/**
 * The `/courses/[displayId]` route. A mounting point and nothing else, exactly like the catalog
 * beside it: every decision about what the page IS lives one tier down, where it can be rendered,
 * tested and changed without a router.
 *
 * It inherits the courses layout, so the navbar and the `main` landmark are already open around it.
 *
 * IT IS A SERVER COMPONENT ONLY TO READ THE SEGMENT. `params` is a promise in Next 16; awaiting it
 * here keeps the display id out of client-side routing state, and the page below is the client
 * boundary that actually fetches.
 */

/** Props Next hands a dynamic segment. */
interface CourseDetailRouteProps {
    /** The resolved route parameters. */
    params: Promise<{ displayId: string }>
}

const CourseDetailRoute = async (input: CourseDetailRouteProps) => {
    const { displayId } = await input.params
    return <CourseDetailPage displayId={displayId} />
}

export default CourseDetailRoute
