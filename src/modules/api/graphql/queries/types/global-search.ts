/** Entity class names accepted by the backend autocomplete request. */
export type GlobalSearchEntity =
    | "CourseEntity"
    | "ModuleEntity"
    | "ContentEntity"
    | "ChallengeEntity"
    | "FlashcardDeckEntity"
    | "MilestoneEntity"
    | "FoundationEntity"

/** One resolved ancestor identity used by canonical fallback paths. */
export type GlobalSearchParentRef = {
    readonly id: string
    readonly displayId: string
}

/** Sparse ancestor chain attached to one search hit. */
export type GlobalSearchParentPath = {
    readonly course?: GlobalSearchParentRef | null
    readonly module?: GlobalSearchParentRef | null
    readonly content?: GlobalSearchParentRef | null
    readonly challenge?: GlobalSearchParentRef | null
    readonly task?: GlobalSearchParentRef | null
}

/** Shared live fields returned for every search entity kind. */
export type GlobalSearchItem = {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly texts: ReadonlyArray<string>
    readonly parentPath?: GlobalSearchParentPath | null
    readonly path?: string | null
    readonly isEnrolled?: boolean | null
    readonly isFree?: boolean | null
    readonly isPremium?: boolean | null
}

/** Eight grouped result buckets returned by the backend. */
export type GlobalSearchData = {
    readonly courses: ReadonlyArray<GlobalSearchItem>
    readonly modules: ReadonlyArray<GlobalSearchItem>
    readonly contents: ReadonlyArray<GlobalSearchItem>
    readonly challenges: ReadonlyArray<GlobalSearchItem>
    readonly flashcardDecks: ReadonlyArray<GlobalSearchItem>
    readonly milestones: ReadonlyArray<GlobalSearchItem>
    readonly milestoneTasks: ReadonlyArray<GlobalSearchItem>
    readonly foundations: ReadonlyArray<GlobalSearchItem>
}

/** Variables accepted by the autocomplete query. */
export type QueryAutocompleteGlobalSearchRequest = {
    readonly query: string
    readonly entities?: ReadonlyArray<GlobalSearchEntity>
    readonly size?: number
}

/** GraphQL response envelope for global autocomplete. */
export type QueryAutocompleteGlobalSearchResponse = {
    readonly autocompleteGlobalSearch?: {
        readonly success: boolean
        readonly message?: string | null
        readonly error?: string | null
        readonly data?: GlobalSearchData | null
    } | null
}
