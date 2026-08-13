import type { CourseDetailPageProps } from "@/components/pages/CourseDetailPage/component"
import fixture from "~candidate/fixtures/course-detail.json"

/**
 * THE STATE INVENTORY, as data rather than as a table in a document.
 *
 * One entry per rendered state. The route generator, the index and the runtime proof all read THIS,
 * so a state cannot be claimed in the record and absent from the build: there is one list and it is
 * the thing that renders.
 *
 * EVERY STATE OPENS ITS OWN DOCUMENT. `routed-page-main` is the document's ONE main landmark, so
 * five scenarios on one page would be five `<main>` elements - exactly the kind of defect this
 * revision exists to remove. Each state is therefore its own static route.
 *
 * THIS FILE HOLDS NO JSX, and that is structural rather than tidy. The route that enumerates states
 * is a server component, while every StarCi leaf reaches HeroUI and therefore `client-only`. Data
 * and render had to be separated for the export to build at all; the type import above is erased, so
 * nothing client-side is pulled in by naming the shape.
 */

/** The course as the page receives it, once the request has settled. */
const settled = {
    labels: fixture.labels,
    title: fixture.title,
    tagline: fixture.tagline,
    stats: fixture.stats,
    valueProps: fixture.valueProps,
    modules: fixture.modules,
    rail: { ...fixture.rail, scarcityLabel: fixture.scarcityLabel },
}

/** One rendered state: an identity, what it proves, and the props that produce it. */
export type RenderedState = {
    /** Stable identity, and the route segment. */
    readonly id: string
    /** What a reviewer is being asked to look at. */
    readonly claim: string
    /** The settled situation to draw. */
    readonly props: CourseDetailPageProps
}

/** Every state this candidate renders. */
export const STATES: ReadonlyArray<RenderedState> = [
    {
        id: "ready",
        claim: "Everything settled. The regions to check are the ones the entries now name: nav, section, aside, ul/li, ol/li. Module five carries no lessons and renders flat rather than as a disclosure onto nothing.",
        props: { state: "ready", props: settled },
    },
    {
        id: "price-pending",
        claim: "The course has settled and the viewer's price has not. The price and everything derived from it rest; the artwork, the ladder, the action and the proof line are known and render as themselves. The pinned bar rests on the same number rather than showing a different one.",
        props: { state: "ready", props: { ...settled, railState: "price-pending" } },
    },
    {
        id: "no-ladder",
        claim: "A course with no phase ladder. The rail omits the ol entirely instead of drawing an empty one, and the remaining four children keep their order.",
        props: { state: "ready", props: { ...settled, rail: { ...settled.rail, phases: [], savingsLabel: undefined, scarcityLabel: undefined } } },
    },
    {
        id: "pending",
        claim: "Nothing has settled. The resting run lengths are the entries' own restingCount - five chips, four promises, five modules - so this state cannot claim a shape the contract does not. The resting rows do not disclose, because there is nothing yet to disclose.",
        props: { state: "pending", props: { labels: fixture.labels, rail: { ...fixture.rail, price: undefined }, railState: "price-pending" } },
    },
    {
        id: "not-found",
        claim: "The displayId names no course. One notice, and deliberately NO action: there is no retry that could change the answer.",
        props: { state: "not-found", props: { labels: fixture.labels, noticeMessage: fixture.notices.notFound.message } },
    },
    {
        id: "failed",
        claim: "The request failed. Same notice shape, but this one offers a way out, because this one may yet succeed.",
        props: { state: "failed", props: { labels: fixture.labels, noticeMessage: fixture.notices.failed.message, noticeActionLabel: fixture.notices.failed.actionLabel } },
    },
]
