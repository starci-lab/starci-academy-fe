import { CourseLearnContentPage } from "~candidate/components/pages/CourseLearnContentPage"

/**
 * The `/courses/[displayId]/learn/content/modules/[moduleId]/contents/[contentId]` route.
 *
 * Target path on materialization:
 * `src/app/[lang]/courses/[displayId]/learn/content/modules/[moduleId]/contents/[contentId]/page.tsx`.
 * IT IS NOT UNDER `app/` HERE, and canon is why: a file under `app/` names which page renders at
 * which URL, and `page`, `layout`, `loading` and `error` are the only slots the framework knows.
 * A proposal for a route is not yet a route - dropping this into the candidate app would create a
 * second route tree inside an artifact, and one that could not be statically exported because it
 * fetches. So it waits here, named for what it will be, and Apply writes it at the path above.
 *
 * A MOUNTING POINT AND NOTHING ELSE, exactly like the course detail route beside it: every decision
 * about what the page IS lives one tier down, where it can be rendered, tested and changed without
 * a router.
 *
 * IT IS A SERVER COMPONENT ONLY TO READ ITS SEGMENTS. `params` is a promise in Next 16; awaiting it
 * here keeps three ids out of client-side routing state, and the page below is the client boundary
 * that fetches.
 *
 * THE PATH KEEPS LEGACY'S SHAPE, and that is deliberate rather than nostalgic: `…/learn/content/
 * modules/<moduleId>/contents/<contentId>` is what every link, bookmark and shared URL in the
 * running product already says. A shorter path would be a nicer path that breaks all of them.
 */

/** Props Next hands a dynamic segment. */
interface CourseLearnContentRouteProps {
    /** The resolved route parameters. */
    params: Promise<{ displayId: string, moduleId: string, contentId: string }>
}

const CourseLearnContentRoute = async (input: CourseLearnContentRouteProps) => {
    const { displayId, moduleId, contentId } = await input.params
    return <CourseLearnContentPage displayId={displayId} moduleId={moduleId} contentId={contentId} />
}

export default CourseLearnContentRoute
