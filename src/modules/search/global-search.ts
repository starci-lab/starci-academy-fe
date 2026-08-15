import type {
    GlobalSearchData,
    GlobalSearchEntity,
    GlobalSearchItem,
} from "@/modules/api/graphql/queries/types/global-search"

/** Product-facing scopes offered by the workspace. */
export type GlobalSearchScope = "all" | "courses" | "learning" | "practice" | "projects" | "foundations"
/** Backend result groups that can contribute visible rows. */
export type GlobalSearchBucket = keyof GlobalSearchData

/** One safe snippet segment with only highlight intent preserved. */
export type GlobalSearchSegment = {
    readonly text: string
    readonly highlighted: boolean
}

/** One flattened, keyed result ready for selection and routing. */
export type GlobalSearchResult = GlobalSearchItem & {
    readonly key: string
    readonly bucket: GlobalSearchBucket
    readonly segments: ReadonlyArray<GlobalSearchSegment>
}

/** Scope order used by desktop and mobile controls. */
export const GLOBAL_SEARCH_SCOPES: ReadonlyArray<GlobalSearchScope> = [
    "all", "courses", "learning", "practice", "projects", "foundations",
]

/** Fixed cross-bucket ordering used only by the All scope. */
export const GLOBAL_SEARCH_BUCKETS: ReadonlyArray<GlobalSearchBucket> = [
    "courses", "modules", "contents", "challenges", "flashcardDecks",
    "milestones", "milestoneTasks", "foundations",
]

const SCOPE_BUCKETS: Record<GlobalSearchScope, ReadonlyArray<GlobalSearchBucket>> = {
    all: GLOBAL_SEARCH_BUCKETS,
    courses: ["courses"],
    learning: ["modules", "contents"],
    practice: ["challenges", "flashcardDecks"],
    projects: ["milestones", "milestoneTasks"],
    foundations: ["foundations"],
}

/** Exact backend entity filters sent for each product scope. */
export const GLOBAL_SEARCH_SCOPE_ENTITIES: Record<GlobalSearchScope, ReadonlyArray<GlobalSearchEntity> | undefined> = {
    all: undefined,
    courses: ["CourseEntity"],
    learning: ["ModuleEntity", "ContentEntity"],
    practice: ["ChallengeEntity", "FlashcardDeckEntity"],
    projects: ["MilestoneEntity"],
    foundations: ["FoundationEntity"],
}

/** Parses only Elasticsearch's highlight markers; every other tag remains ordinary text. */
export const parseGlobalSearchSnippet = (value: string): ReadonlyArray<GlobalSearchSegment> => {
    const parts = value.split(/(<\/?em>)/iu)
    let highlighted = false
    const segments: Array<GlobalSearchSegment> = []
    for (const part of parts) {
        if (part.toLowerCase() === "<em>") {
            highlighted = true
        } else if (part.toLowerCase() === "</em>") {
            highlighted = false
        } else if (part.length > 0) {
            segments.push({ text: part, highlighted })
        }
    }
    return segments
}

/** Flattens only the buckets admitted by a scope in the approved order. */
export const flattenGlobalSearch = (
    data: GlobalSearchData | null | undefined,
    scope: GlobalSearchScope,
): ReadonlyArray<GlobalSearchResult> => {
    if (data === null || data === undefined) return []
    return SCOPE_BUCKETS[scope].flatMap((bucket) => data[bucket].map((item) => ({
        ...item,
        key: `${bucket}:${item.id}`,
        bucket,
        segments: parseGlobalSearchSnippet(item.texts[0] ?? item.title),
    })))
}

/** Counts currently returned rows for one scope without claiming a server total. */
export const countGlobalSearchScope = (
    data: GlobalSearchData | null | undefined,
    scope: GlobalSearchScope,
) => data === null || data === undefined
    ? 0
    : SCOPE_BUCKETS[scope].reduce((total, bucket) => total + data[bucket].length, 0)
