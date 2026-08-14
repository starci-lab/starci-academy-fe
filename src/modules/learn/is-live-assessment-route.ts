/**
 * Whether a learn route owns the whole viewport for an active evaluated experience.
 *
 * The learn shell and the global AI host share this predicate deliberately: if either grows its
 * own route list, the shell can expose navigation while AI hides (or the reverse) over the same
 * assessment. Result pages are excluded because the live interaction has already ended there.
 */
export const isLiveAssessmentRoute = (pathname: string): boolean => (
    pathname.includes("/learn/mind-map")
    || /\/learn\/mock-interview\/interview\/[^/]+$/.test(pathname)
    || /\/learn\/playground\/[^/]+\/session$/.test(pathname)
    || /\/learn\/flashcards\/(?:review|quiz)\/sessions\/[^/]+$/.test(pathname)
)

