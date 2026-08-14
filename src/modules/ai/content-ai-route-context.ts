/** The product scope grounding one Content AI conversation. */
export type ContentAiScope = "content" | "task" | "challenge" | "foundation" | "course" | "global"

/** Stable route evidence attached to the next AI question. */
export type ContentAiRouteAnchor = {
    readonly scope: ContentAiScope
    readonly id?: string
    readonly path: string
}

const ROUTE_SCOPE_SEGMENTS: ReadonlyArray<readonly [ContentAiScope, string]> = [
    ["content", "contents"],
    ["task", "tasks"],
    ["challenge", "challenges"],
    ["foundation", "foundations"],
    ["course", "courses"],
]

/** Drop query/hash/locale so every caller compares the same path identity. */
export const normalizeContentAiPath = (pathname: string): string => {
    const clean = pathname.split(/[?#]/u, 1)[0] ?? "/"
    const segments = clean.split("/").filter(Boolean)
    const withoutLocale = segments[0] === "en" || segments[0] === "vi" ? segments.slice(1) : segments
    return `/${withoutLocale.join("/")}`.replace(/\/$/u, "") || "/"
}

/** Resolve the narrowest supported grounding id from a product route. */
export const resolveContentAiRouteAnchor = (pathname: string): ContentAiRouteAnchor => {
    const path = normalizeContentAiPath(pathname)
    const segments = path.split("/").filter(Boolean)
    for (const [scope, segment] of ROUTE_SCOPE_SEGMENTS) {
        const index = segments.lastIndexOf(segment)
        const id = index < 0 ? undefined : segments[index + 1]
        if (id !== undefined && id !== "") return { scope, id, path }
    }
    return { scope: "global", path }
}

/** Auth and focused live-evaluation routes do not mount the global assistant. */
export const isContentAiRouteHidden = (pathname: string): boolean => {
    const path = normalizeContentAiPath(pathname)
    if (path === "/authentication" || path.startsWith("/authentication/")) return true
    return [
        /\/learn\/challenge(?:\/|$)/u,
        /\/learn\/flashcards\/(?:quiz|session)(?:\/|$)/u,
        /\/learn\/mock-interview\/session(?:\/|$)/u,
        /\/learn\/playgrounds\/[^/]+\/session(?:\/|$)/u,
    ].some((pattern) => pattern.test(path))
}

/** Route navigation changes grounding when either its scope, id or normalized path changes. */
export const isSameContentAiAnchor = (left: ContentAiRouteAnchor, right: ContentAiRouteAnchor): boolean =>
    left.scope === right.scope && left.id === right.id && left.path === right.path
