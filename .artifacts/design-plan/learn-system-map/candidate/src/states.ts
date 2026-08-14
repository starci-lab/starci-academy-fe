import type { CourseLearnContentPageProps } from "~candidate/components/pages/CourseLearnContentPage/component"
import type { ContentFaceTab } from "~candidate/components/blocks/learn/ContentTabRow/component"
import type { ContentOutlineEntry } from "~candidate/components/pages/CourseLearnContentPage/component"
import fixture from "~candidate/fixtures/content.json"

/**
 * THE STATE INVENTORY, as data rather than as a table in a document.
 *
 * One entry per rendered state. The route generator, the index and any later proof read THIS, so a
 * state cannot be claimed in the record and absent from the build: there is one list and it is the
 * thing that renders.
 *
 * EVERY STATE OPENS ITS OWN DOCUMENT, because the page holds the document's one main landmark and
 * eight scenarios on one page would be eight of them.
 *
 * NO JSX HERE. The route that enumerates states is a server component while every StarCi leaf
 * reaches HeroUI and therefore `client-only`; the type import above is erased, so naming the shape
 * pulls nothing client-side into the server file.
 */

/** The content as the reader receives it once the request has settled. */
/** The faces, narrowed once so every state below reads the same list. */
const faces = fixture.faces as ReadonlyArray<ContentFaceTab>
// JSON widens a literal depth to `number`; the outline admits only the three levels it draws.
const outline = fixture.outline as ReadonlyArray<ContentOutlineEntry>

const settled = {
    labels: fixture.labels,
    title: fixture.title,
    // JSON widens every string, so the glyph name arrives as `string` and the leaf admits only its
    // own closed set. The narrowing happens HERE, at the fixture boundary, rather than by loosening
    // the leaf: a fixture is data from outside the type system and this is the one place that knows it.
    faces,
    selectedFace: fixture.selectedFace,
    languagesLabel: fixture.languagesLabel,
    languages: fixture.languages,
    selectedLanguage: fixture.selectedLanguage,
    body: fixture.body,
    courseProgress: fixture.courseProgress,
    modules: fixture.modules,
    outline,
    selectionHint: fixture.selectionHint,
    nextSteps: fixture.nextSteps,
    page: fixture.page,
    totalPages: fixture.totalPages,
    reactions: fixture.reactions,
}

/** One rendered state: what it is called, why it exists, and the exact props that produce it. */
export interface RenderedState {
    readonly id: string
    readonly note: string
    readonly props: CourseLearnContentPageProps
}

/** Every state this candidate renders, in the order a reviewer meets them. */
export const STATES: ReadonlyArray<RenderedState> = [
    {
        id: "reader-ready",
        note: "The ordinary case: three faces, an article of three sections, reactions, what to do next, and the content's place in its module.",
        props: { state: "ready", props: settled },
    },
    {
        id: "reader-pending",
        note: "The request is in flight. The title and the faces are known before it settles, so only the article rests.",
        props: { state: "pending", props: { labels: fixture.labels, title: fixture.title, faces, selectedFace: fixture.selectedFace, courseProgress: fixture.courseProgress, modules: fixture.modules } },
    },
    {
        id: "reader-single-face",
        note: "A content carrying only prose. The face bar is ABSENT rather than drawn with one tab: a control that cannot switch anything reads as broken.",
        props: { state: "ready", props: { ...settled, faces: [faces[0]] } },
    },
    {
        id: "reader-locked",
        note: "A premium content. The notice replaces the reading in the place the reader was already looking, rather than sitting beside it.",
        props: {
            state: "locked",
            props: { ...settled, noticeMessage: fixture.lockedMessage, noticeActionLabel: fixture.lockedAction },
        },
    },
    {
        id: "reader-failed",
        note: "The request failed. Same slot, different sentence - and no reactions or pager, because there is nothing to react to or page through.",
        props: {
            state: "failed",
            props: { ...settled, noticeMessage: fixture.failedMessage, noticeActionLabel: fixture.failedAction },
        },
    },
    {
        id: "reader-first-content",
        note: "The first content of a module: the pager stands, with no previous to offer.",
        props: { state: "ready", props: { ...settled, page: 1 } },
    },
    {
        id: "reader-last-content",
        note: "The last content: the pager stands, with no next.",
        props: { state: "ready", props: { ...settled, page: fixture.totalPages } },
    },
    {
        id: "reader-no-next-steps",
        note: "A content that leads nowhere in particular. The joined list is absent rather than titled and empty.",
        props: { state: "ready", props: { ...settled, nextSteps: [] } },
    },
]
