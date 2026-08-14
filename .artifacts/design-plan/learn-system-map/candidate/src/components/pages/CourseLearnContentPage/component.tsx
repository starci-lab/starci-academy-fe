import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { SurfaceCard } from "~candidate/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "~candidate/components/branches/SurfaceListCard"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { NavLink } from "~candidate/components/leaves/NavLink"
import { ContentMapRow } from "~candidate/components/leaves/ContentMapRow"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Icon } from "@/components/leaves/Icon"
import { Heading } from "@/components/leaves/Heading"
import { Pagination } from "@/components/leaves/Pagination"
import { ReactionPicker, type ReactionLabels } from "@/components/leaves/ReactionPicker"
import { Text } from "@/components/leaves/Text"
import { contentTabRow, type ContentFaceTab, type ContentLanguageTab } from "~candidate/components/blocks/learn/ContentTabRow/component"
// Contract machinery through the candidate mirror, and only because `ContractKey` is closed over the
// table on disk: the entries this page needs are proposals, not yet law. The mirror is the locked
// `contracts/*` and `branches/Tree` copied verbatim with their imports repointed; on materialization
// these specifiers become `@/`.
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "~candidate/components/contracts/props"

/**
 * PAGE - `CourseLearnContentPage`: one content, read.
 *
 * Target path on materialization: `src/components/pages/CourseLearnContentPage/component.tsx`.
 *
 * REBUILT FROM `pages/ContentPage` AT `9a19342`, READ RATHER THAN REMEMBERED. Revision 1.1 was drawn
 * from a description of that page and diverged from it in five places at once, so this one follows
 * its composition line by line and records each difference on purpose:
 *
 * THREE BLOCKS AT ONE SEAM. Header, tab bar, then a column holding everything under it. The column
 * takes NO gap: the article, the reaction, what comes next and the pager are one continuous reading,
 * each already closing with its own trailing space, and a seam there would read as the page changing
 * subject halfway down.
 *
 * THE ARTICLE IS READ ON PAPER. Legacy sets the content on a card and leaves the chrome around it
 * bare; that card is what tells a reader at a glance where the content stops. Revision 1.1 set the
 * prose straight on the page background and lost the distinction entirely.
 *
 * THE BAR IS NEVER SKELETONISED. Legacy renders the real tab bar while the content is still in
 * flight, because the faces are known from the route: the chrome is already true, and resting it
 * would claim the page does not yet know what it is.
 *
 * A LOCKED CONTENT KEEPS ITS PAPER. The paywall joins the preview INSIDE the same card rather than
 * replacing it - being shown what you would be reading is the entire argument for paying - and the
 * whole footer goes, because there is nothing yet to react to, to page past, or to go on to.
 *
 * WHAT THIS REVISION DELIBERATELY DOES NOT DRAW, each recorded rather than dropped: the fade over a
 * locked preview (legacy's `LockedContentMask` - a new owner nobody has approved, so the preview is
 * simply short), the discussion thread, the inline advertisement, and the two desktop rails. Each is
 * its own case with its own states.
 */

/** The situations the reader can be in. */
export type CourseLearnContentPageState = "pending" | "ready" | "locked" | "failed"

/** One face of a content - a tab the content actually carries. Owned by the row that draws it. */
export type ContentFace = ContentFaceTab

/** One section of the article: a title and the paragraphs under it. */
export type ContentSection = {
    readonly id: string
    readonly title: string
    readonly paragraphs: ReadonlyArray<string>
}

/** One way on from this content. */
export type ContentNextStep = {
    readonly id: string
    readonly label: string
    readonly isComplete?: boolean
}

/** Every already-resolved string the reader renders. */
export type CourseLearnContentPageLabels = {
    readonly navCourse: string
    readonly navModule: string
    readonly facesLabel: string
    /** The prompt, accessible name and clear control of the contents search. */
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly searchClearLabel: string
    /** The name of the outline rail - the docs word for where you are in the page. */
    readonly outlineTitle: string
    readonly pageLabel: string
    readonly previousLabel: string
    readonly nextLabel: string
    readonly reactionsLabel: string
    /** The question the reaction card asks, so the control is not a number sitting alone. */
    readonly reactionPrompt: string
    /** The name of the joined list of destinations under the content. */
    readonly nextTitle: string
}

/** What the reader draws. */
export type CourseLearnContentPageData = {
    readonly labels: CourseLearnContentPageLabels
    readonly title?: string
    /** The faces this content carries. One face means the bar states the obvious, so it is absent. */
    readonly faces?: ReadonlyArray<ContentFace>
    readonly selectedFace?: string
    /** The languages the examples can be read in, and which is open. */
    readonly languagesLabel?: string
    readonly languages?: ReadonlyArray<ContentLanguageTab>
    readonly selectedLanguage?: string
    readonly sections?: ReadonlyArray<ContentSection>
    /** The one line above an unlocked content telling the reader what selecting text will do. */
    readonly selectionHint?: string
    /** What the reader is told instead of - or under - the article, when locked or failed. */
    readonly noticeMessage?: string
    readonly noticeActionLabel?: string
    readonly nextSteps?: ReadonlyArray<ContentNextStep>
    readonly page?: number
    readonly totalPages?: number
    /** How many readers have reacted, and the six names the control announces. */
    readonly reactions?: {
        readonly count: number
        readonly labels: ReactionLabels
    }
    /** How far into the course the reader is, drawn at the top of the contents panel. */
    readonly courseProgress?: {
        readonly label: string
        readonly value: number
        readonly total: number
    }
    /** The course tree in the map panel: every module, and the contents of the open one. */
    readonly modules?: ReadonlyArray<CourseModule>
    /** The places inside THIS content, and which one the reader is level with. */
    readonly outline?: ReadonlyArray<ContentOutlineEntry>
}

/** One module of the course as the contents panel draws it. */
export type CourseModule = {
    readonly id: string
    readonly title: string
    readonly countLabel?: string
    readonly isOpen?: boolean
    readonly contents?: ReadonlyArray<{
        readonly id: string
        readonly title: string
        readonly meta?: string
        readonly isComplete?: boolean
        readonly isCurrent?: boolean
    }>
}

/** One place inside the content, as the outline rail draws it. */
export type ContentOutlineEntry = {
    readonly id: string
    readonly label: string
    readonly isCurrent?: boolean
    /** How deep inside the article this place sits - the outline is a tree, not a list. */
    readonly depth?: 1 | 2 | 3
}

/** What the reader reports. */
export type CourseLearnContentPageActions = {
    readonly selectFace?: (face: string) => void
    readonly selectLanguage?: (language: string) => void
    readonly changePage?: (page: number) => void
    readonly act?: () => void
    readonly goCourse?: () => void
    readonly [key: string]: ((...args: Array<never>) => void) | undefined
}

/** Props for {@link _CourseLearnContentPage}. */
export type CourseLearnContentPageProps = {
    readonly state: CourseLearnContentPageState
    readonly props: CourseLearnContentPageData
    readonly on?: CourseLearnContentPageActions
}

/** How many sections rest while the content is in flight. */
const RESTING_SECTIONS = 3

/** How much of a locked content is shown before the paywall: enough to judge, not enough to read. */
const PREVIEW_SECTIONS = 1

/** What the joined list of destinations draws - the steps, in the order the module gives them. */
type ContentNextStepsData = SurfaceListCardData & {
    readonly steps: ReadonlyArray<ContentNextStep>
}

/**
 * Turn where a content leads into the repeated row its list contract admits.
 *
 * THE ROW CARRIES NO TICK. Legacy draws an up-next card and a related-content list under the
 * content; both answer one question, so they are one named joined list here rather than two
 * surfaces - and a completion mark would promise something to finish, while these are places to
 * open.
 */
const ContentNextStepsView = ({ props }: LeafProps<ContentNextStepsData>) => (
    <Tree
        contract="content-next-list"
        render={defineContractComponent("content-next-list", {
            step: props.steps.map((step) => defineContractComponent("content-next-row", {
                label: defineLeafComponent("text", { size: "md" }, () => (
                    <Text props={{ content: step.label, size: "md" }} />
                )),
                disclosure: defineLeafComponent("icon", {}, () => (
                    <Icon props={{ name: "next", role: "chip" }} />
                )),
            })),
        })}
    />
)

/** Stable component type branded for the exact list contract it implements. */
const ContentNextSteps = defineContractComponent("content-next-list", ContentNextStepsView)

/**
 * Draw one content.
 *
 * @param input - {@link CourseLearnContentPageProps}
 */
export const _CourseLearnContentPage = (input: CourseLearnContentPageProps) => {
    const labels = input.props.labels
    const isLoading = input.state === "pending"
    const isLocked = input.state === "locked"
    const hasFailed = input.state === "failed"
    const faces = input.props.faces ?? []
    const resting = Array.from({ length: RESTING_SECTIONS }, (_unused, index) => ({
        id: `resting-${index + 1}`,
        title: "",
        paragraphs: ["", ""],
    }))
    const written = input.props.sections ?? []
    const sections = isLoading
        ? resting
        : isLocked ? written.slice(0, PREVIEW_SECTIONS) : written

    const header = defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: input.props.title ?? "",
                    steps: [
                        { id: "course", label: labels.navCourse },
                        { id: "module", label: labels.navModule },
                    ],
                }}
                on={{ course: input.on?.goCourse }}
            />
        )),
        title: defineLeafComponent("heading", {}, () => (
            <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
        )),
    })

    const article = defineContractComponent("content-article-body", {
        block: sections.map((section) => defineContractComponent("heading-over-paragraph", {
            title: defineLeafComponent("heading", {}, () => (
                <Heading props={{ content: section.title, level: 2 }} isLoading={isLoading} />
            )),
            body: section.paragraphs.map((paragraph) => defineLeafComponent("text", { size: "md" }, () => (
                <Text props={{ content: paragraph, size: "md" }} isLoading={isLoading} />
            ))),
        })),
    })

    /*
     * The paper. It is a projection rather than slots, because the surface branch has already drawn
     * a whole node - vendor card, body, and the entry inside it - and handing the key back as slots
     * would open a second node around a node that exists.
     */
    const paper = defineContractProjection("content-reading-paper", () => (
        <SurfaceCard
            contract="content-reading-paper"
            render={defineContractComponent("content-reading-paper", {
                ...(isLoading || isLocked || input.props.selectionHint === undefined ? {} : {
                    hint: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: input.props.selectionHint, size: "sm", tone: "muted" }} />
                    )),
                }),
                article,
                ...(isLocked ? {
                    paywall: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{
                                icon: "course",
                                message: input.props.noticeMessage ?? "",
                                actionLabel: input.props.noticeActionLabel,
                            }}
                            on={{ act: input.on?.act }}
                        />
                    )),
                } : {}),
            })}
        />
    ))

    /*
     * What follows the content, and only when there IS a content: a locked or resting reader is offered
     * nothing to react to, to go on to, or to page past, so the whole run is absent rather than
     * present and inert.
     */
    const hasFooter = !isLoading && !isLocked && !hasFailed
    const footer = defineContractComponent("content-reader-footer", {
        ...(input.props.reactions === undefined ? {} : {
            reactions: defineContractProjection("content-reaction-card", () => (
                <SurfaceCard
                    contract="content-reaction-card"
                    render={defineContractComponent("content-reaction-card", {
                        prompt: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                            <Text props={{ content: labels.reactionPrompt, size: "sm", tone: "muted" }} />
                        )),
                        reactions: defineLeafComponent("reaction-picker", {}, () => (
                            <ReactionPicker
                                props={{
                                    label: labels.reactionsLabel,
                                    count: input.props.reactions?.count ?? 0,
                                    labels: input.props.reactions?.labels ?? ({} as ReactionLabels),
                                }}
                            />
                        )),
                    })}
                />
            )),
        }),
        ...((input.props.nextSteps ?? []).length === 0 ? {} : {
            next: defineContractProjection("content-next-list", () => (
                <SurfaceListCard
                    props={{ label: labels.nextTitle, steps: [...(input.props.nextSteps ?? [])] }}
                    contract="content-next-list"
                    render={ContentNextSteps}
                />
            )),
        }),
        // The pager is the content's place in its module, so it stands even at one page - furniture
        // that appears with the data teaches a reader the page changed shape.
        pager: defineLeafComponent("pagination", {}, () => (
            <Pagination
                props={{
                    label: labels.pageLabel,
                    total: input.props.totalPages ?? 1,
                    page: input.props.page ?? 1,
                    previousLabel: labels.previousLabel,
                    nextLabel: labels.nextLabel,
                }}
                on={{ change: input.on?.changePage }}
            />
        )),
    })

    const body = hasFailed
        ? defineContractComponent("centred-empty-notice", {
            notice: defineCompositeComponent("empty-notice", {}, () => (
                <EmptyNotice
                    props={{
                        icon: "course",
                        message: input.props.noticeMessage ?? "",
                        actionLabel: input.props.noticeActionLabel,
                    }}
                    on={{ act: input.on?.act }}
                />
            )),
        })
        : defineContractComponent("content-reading-column", {
            reading: paper,
            ...(hasFooter ? { footer } : {}),
        })

    /*
     * WHERE THE READER IS IN THE COURSE. The panel is part of the reader rather than of the shell:
     * the plan record puts the contents panel and the outline in this work item, and a reading
     * measure cannot be judged without the columns standing either side of it.
     */
    const progress = input.props.courseProgress
    const progressPercent = progress === undefined ? undefined : Math.round((progress.value / progress.total) * 100)
    const contents = defineContractComponent("content-map-panel", {
        progress: defineCompositeComponent("labelled-progress-row", {}, () => (
            <LabelledProgressRow
                props={{
                    id: "course-progress",
                    title: input.props.courseProgress?.label,
                    percent: progressPercent,
                    percentText: input.props.courseProgress === undefined ? undefined : `${input.props.courseProgress.value}/${input.props.courseProgress.total}`,
                }}
                isLoading={isLoading}
            />
        )),
        search: defineLeafComponent("search-box", {}, () => (
            <SearchBox
                props={{
                    placeholder: labels.searchPlaceholder,
                    label: labels.searchLabel,
                    clearLabel: labels.searchClearLabel,
                }}
            />
        )),
        module: (input.props.modules ?? []).map((module) => defineContractComponent("content-map-module", {
            title: defineContractComponent("title-with-baseline-fact", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: module.title, level: 3 }} isLoading={isLoading} />
                )),
                fact: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: module.countLabel, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
            // A module the reader has not opened carries no rows at all: the map is scanned by
            // module first, and four closed modules each showing five contents is not a map.
            row: (module.isOpen === true ? module.contents ?? [] : []).map((content) => defineLeafComponent("content-map-row", {}, () => (
                <ContentMapRow
                    props={{
                        id: content.id,
                        title: content.title,
                        meta: content.meta,
                        isComplete: content.isComplete,
                        isCurrent: content.isCurrent,
                    }}
                    isLoading={isLoading}
                />
            ))),
        })),
    })

    /*
     * WHERE THE READER IS IN THE PAGE - and absent rather than empty when there is nothing to
     * outline. A tab of cards carries no headings, and a rail standing empty would take width from
     * the reading in exchange for nothing.
     */
    const outlineEntries = hasFailed || isLoading ? [] : input.props.outline ?? []
    const outline = defineContractComponent("content-outline-rail", {
        label: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
            <Text props={{ content: labels.outlineTitle, size: "sm", tone: "muted" }} />
        )),
        heading: outlineEntries.map((entry) => defineLeafComponent("nav-link", { kind: "section" }, () => (
            <NavLink props={{ label: entry.label, kind: "section", depth: entry.depth, isCurrent: entry.isCurrent }} />
        ))),
    })

    const reader = defineContractComponent("learn-content-page", {
        header,
        /*
                 * The bar is real at every state, which is the legacy decision this restores: the
                 * faces come from the route rather than from the content body, so they are already
                 * true while the body is still arriving. A single face is still not a choice - a
                 * one-tab bar reads as a control that does not work.
                 */
        ...(faces.length > 1 || (input.props.languages ?? []).length > 1 ? {
            faces: contentTabRow(
                {
                    facesLabel: labels.facesLabel,
                    faces,
                    selectedFace: input.props.selectedFace,
                    languagesLabel: input.props.languagesLabel,
                    languages: input.props.languages,
                    selectedLanguage: input.props.selectedLanguage,
                },
                { selectFace: input.on?.selectFace, selectLanguage: input.on?.selectLanguage },
            ),
        } : {}),
        body,
    })

    return (
        <Tree
            contract="content-reader-frame"
            render={defineContractComponent("content-reader-frame", {
                contents,
                main: reader,
                ...(outlineEntries.length === 0 ? {} : { outline }),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
