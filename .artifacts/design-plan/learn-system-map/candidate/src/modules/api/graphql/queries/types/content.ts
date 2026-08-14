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
}

/** The module a content belongs to, selected only as far as the map needs it. */
export interface ContentModule {
    /** Stable identity. */
    id: string
    /** The already-resolved module title. */
    title: string
    /** How many contents the module holds, for the count on its summary line. */
    numContents: number
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
    /** Whether reading this requires enrolment. */
    isPremium: boolean
    /** How long it takes to read, in minutes. */
    minutesRead: number
    /** Declaration order inside the module - the reader's place in it. */
    orderIndex: number
    /** The module this content belongs to. */
    module: ContentModule
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
