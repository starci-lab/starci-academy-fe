import { type GraphQLResponse } from "@/modules/api/graphql/types"

/**
 * One content, as the reader selects it.
 *
 * Deliberately NOT the server's whole `ContentEntity`. That type reaches into translations,
 * challenges, flashcards, sandbox repositories and AI sessions; this carries exactly the fields the
 * document selects, a field added here is added to the document in the same edit, and a field the
 * document does not select does not belong here - the same rule `course.ts` states.
 */

/** One content of the module this reader is in, as the map draws it. */
export interface ContentSibling {
    /** Stable identity, and the segment the reader navigates to. */
    id: string
    /** The already-resolved title. */
    title: string
    /** How long the content takes to read, in minutes, as the server measured it. */
    minutesRead: number
    /** Whether reading it requires enrolment. */
    isPremium: boolean
    /** Declaration order, so the module reads in the sequence its author set. */
    orderIndex: number
    /** Challenges attached to this lesson, in authored order. */
    challenges?: ReadonlyArray<ContentChallenge>
}

/** One deliverable accepted by a content challenge. */
export interface ContentChallengeSubmission {
    readonly id: string
    readonly title: string
    readonly description: string | null
    readonly score: number
    readonly sortIndex: number
}

/** One challenge face attached to the content returned by the reader query. */
export interface ContentChallenge {
    readonly id: string
    readonly displayId: string
    readonly title: string
    readonly description: string
    readonly score: number
    readonly difficulty: "easy" | "medium" | "hard" | "insane" | "expert"
    readonly orderIndex: number
    readonly hint: string | null
    readonly submissions: ReadonlyArray<ContentChallengeSubmission>
}

/** One localized variant of a SCHEMA V2 language body. */
export interface ContentBodyTranslation {
    /** Locale carried by this translation row. */
    readonly locale: string
    /** Localized markdown, or null when the locale intentionally has no body. */
    readonly body: string | null
}

/** One programming-language reading body attached to a SCHEMA V2 lesson. */
export interface ContentBody {
    /** Stable body-bucket identity. */
    readonly id: string
    /** Programming-language identity such as `typescript`, `java`, `csharp`, or `go`. */
    readonly lang: string
    /** Authored display order of the language tabs. */
    readonly orderIndex: number
    /** Default-locale markdown body. */
    readonly body: string | null
    /** Locale used by {@link body} when no matching translation exists. */
    readonly defaultLocale: string
    /** Per-locale markdown variants exposed by the current content snapshot. */
    readonly translations: ReadonlyArray<ContentBodyTranslation>
}

/** One content, read. */
export interface ContentDetail {
    /** Stable identity. */
    id: string
    /** The human-facing identifier the mount folder carries. */
    displayId: string
    /** The already-resolved title, drawn as the page's own heading. */
    title: string
    /** The optional summary above the body. */
    description: string | null
    /**
     * The markdown body.
     *
     * ALREADY TRUNCATED WHEN THE VIEWER IS NOT ENTITLED. The handler cuts a premium body server-side
     * and returns it beside `isPremium`, which is why the page draws what it was given rather than
     * deciding for itself how much of a paid lesson a reader may see. A client that cut the body
     * would be a client that could be asked not to.
     */
    body: string
    /** SCHEMA V2 language bodies. Empty/omitted for legacy scalar-body lessons. */
    bodies?: ReadonlyArray<ContentBody>
    /** Whether reading this requires enrolment. */
    isPremium: boolean
    /** Whether this lesson owns a synchronized browser sandbox snapshot. */
    isSandbox: boolean
    /** GitHub repository identity used by the backend synchronizer; never fetched directly here. */
    githubBaseUrl: string | null
    /** Repository-relative directory synchronized into the lesson snapshot. */
    githubDir: string | null
    /** Optional mock-service path injected into sandbox source at runtime. */
    backendUrl: string | null
    /** How long it takes to read, in minutes. */
    minutesRead: number
    /** Declaration order inside the module - the reader's place in it. */
    orderIndex: number
    /** The finite challenge faces the reader may open from this lesson. */
    challenges?: ReadonlyArray<ContentChallenge>
}

/** What the reader must say about the content it wants. Exactly one of the two. */
export interface QueryContentRequest {
    /** The content's primary id. */
    id?: string
    /** The content's display id. */
    displayId?: string
}

/** The envelope the server returns. */
export interface QueryContentResponse {
    /** The single-content answer. */
    content: GraphQLResponse<ContentDetail>
}
