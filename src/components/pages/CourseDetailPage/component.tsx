import { CONTRACTS } from "@/components/contracts"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard, type SurfaceListCardData } from "@/components/branches/SurfaceListCard"
import { Tree } from "@/components/branches/Tree"
import { CoursePrerequisiteListBase, type CoursePrerequisite } from "@/components/blocks/courses/CoursePrerequisiteList/component"
import { CourseReviewBlockBase, type CourseReview } from "@/components/blocks/courses/CourseReviewBlock/component"
import { CourseValuePropositionList } from "@/components/blocks/courses/CourseValuePropositionList/component"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import {
    CourseCurriculumAccordion,
    type CourseCurriculumModule,
} from "@/components/composites/CourseCurriculumAccordion"
import {
    TitleDescriptionAccordion,
    type TitleDescriptionAccordionItem,
} from "@/components/composites/TitleDescriptionAccordion"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"
import { CoursePricingRail, CoursePricingRailMobile } from "@/components/blocks/courses/CoursePricingRail"

/**
 * PAGE - `CourseDetailPage`: what the course is, what it promises, what it contains, and one place
 * to buy it.
 *
 * Target path: `src/components/pages/CourseDetailPage/component.tsx`.
 *
 * THE SELECTED DIRECTION, `direction-parity-semantic`. The reading order and the anatomy are the
 * named production render's, unchanged. What this direction adds is that every region now SAYS what
 * it is - the trail is a `nav`, the narrative and its two regions are `section`s, the buy box is an
 * `aside`, the promises are a `ul` of `li`, the curriculum is an `ol` of `li` - and it says so in
 * the registry entry rather than here.
 *
 * NOTHING IN THIS FILE CHOOSES AN ELEMENT. Every node below is a key; the entry behind it names the
 * tag. That is the property being reviewed, so a call site able to override it would defeat the
 * review as surely as one that hand-wrote a `div`.
 *
 * THE HERO CARRIES NO PRICE and no action, because the rail is the only buy box; two of them would
 * make a reader decide which one is authoritative.
 *
 * THE TRUST CHIPS ARE EVIDENCE, NOT DECORATION. Learners, modules, lessons, hours and challenges are
 * derived from the course's own module tree - the legacy page computes them client-side the same
 * way - so they are facts about this course rather than marketing adjectives.
 *
 * WHAT THIS PRESENTATIONAL HALF IS NOT. It takes one already-settled situation and draws it. In
 * production the regions settle independently: the rail owns the price preview, the curriculum owns
 * the module tree, and neither waits on the other. The single `state` here is the candidate's
 * scenario switch standing in for those connected halves.
 */

/** One trust chip. */
export type CourseStat = {
    /** Stable identity. */
    readonly id: string
    /** The short qualifier above the figure. */
    readonly label: string
    /** The already-formatted evidence figure. */
    readonly value: string
}

/** The real sections the course-page tabs can reach. */
export type CourseDetailSection = "overview" | "curriculum" | "reviews" | "faq"

/** One authored question/answer pair, normalized to the shared disclosure grammar. */
export type CourseFaq = TitleDescriptionAccordionItem

/** One curriculum module with the complete structured disclosure anatomy. */
export type CourseModule = CourseCurriculumModule

/** Every already-resolved string the page renders. */
export type CourseDetailLabels = {
    /** Accessible name for the route trail. */
    readonly breadcrumbLabel: string
    /** Root breadcrumb. */
    readonly breadcrumbHome: string
    /** Course catalogue breadcrumb. */
    readonly breadcrumbCourses: string
    /** Accessible name for the section tabs. */
    readonly sectionTabsLabel: string
    /** Overview tab. */
    readonly overviewTab: string
    /** Curriculum tab. */
    readonly curriculumTab: string
    /** Reviews tab. */
    readonly reviewsTab: string
    /** FAQ tab. */
    readonly faqTab: string
    /** Promises section title. */
    readonly valuePropsTitle: string
    /** Curriculum section title. */
    readonly curriculumTitle: string
    /** Prerequisites section title. */
    readonly prerequisitesTitle: string
    /** Reviews section title. */
    readonly reviewsTitle: string
    /** What the reviews region says when nobody has reviewed yet. */
    readonly reviewsEmpty: string
    /** FAQ section title. */
    readonly faqTitle: string
    /** What the FAQ region says when no rows are authored. */
    readonly faqEmpty: string
    /** Already-formatted "N reviews" copy. */
    readonly reviewCount: string
}

/** What the page draws. */
export type CourseDetailPageData = {
    /** Every already-resolved string. */
    readonly labels: CourseDetailLabels
    /** The section most recently selected from the page navigation. */
    readonly selectedSection?: CourseDetailSection
    /** The course title. */
    readonly title?: string
    /** The one sentence qualifying the title. */
    readonly tagline?: string
    /** The trust chips. */
    readonly stats?: ReadonlyArray<CourseStat>
    /** The promises. */
    readonly valueProps?: ReadonlyArray<string>
    /** What a learner should already meet, in the order the course stores them. */
    readonly prerequisites?: ReadonlyArray<CoursePrerequisite>
    /** The reviews on the first page, newest first. */
    readonly reviews?: ReadonlyArray<CourseReview>
    /** Authored course FAQs in declaration order. */
    readonly faqs?: ReadonlyArray<CourseFaq>
    /** Mean across every review, from the projection rather than from the rows above. */
    readonly averageScore?: number
    /** How many reviews the course carries in total. */
    readonly reviewTotal?: number
    /** The curriculum. */
    readonly modules?: ReadonlyArray<CourseModule>
    /** Message for the not-found and failed situations. */
    readonly noticeMessage?: string
    /** Recovery action label for those situations. */
    readonly noticeActionLabel?: string
}

/** What the page reports. */
export type CourseDetailPageActions = {
    /** Return through the breadcrumb to the product home. */
    readonly navigateHome?: () => void
    /** Return through the breadcrumb to the course catalogue. */
    readonly navigateCourses?: () => void
    /** Move the reader to one real section on this page. */
    readonly selectSection?: (section: CourseDetailSection) => void
    /** Recovery from the failed situation. */
    readonly retry?: () => void
}

/** The situations the page can be in. */
export type CourseDetailPageState = "pending" | "ready" | "not-found" | "failed"

/** Props for {@link CourseDetailPageBase}. */
export type CourseDetailPageProps = {
    /** Route identity used by the connected commerce projection. */
    readonly displayId: string
    readonly pageState: CourseDetailPageState
    /** What that tree says. */
    readonly props: CourseDetailPageData
    /** What the page reports. */
    readonly on?: CourseDetailPageActions
}

const reviewStateOf = (total: number | undefined): "unrated" | "rated" => (total ?? 0) === 0 ? "unrated" : "rated"

/**
 * How many resting rows each run shows while its values are unknown.
 *
 * Read out of the ENTRIES rather than written here. `restingCount` is the number the contract
 * already states, and a second copy in this file is a number that can drift from it silently - the
 * skeleton would keep claiming five modules after the entry had settled on three.
 */
const RESTING = {
    stats: CONTRACTS["course-signal-board"].children.signal.restingCount,
    promises: CONTRACTS["marked-row-list"].children.row.restingCount,
    modules: CONTRACTS["course-curriculum-disclosure"].children.summary.restingCount,
    prerequisites: CONTRACTS["course-prerequisite-list"].children.prerequisite.restingCount,
    faqs: CONTRACTS["title-description-disclosure"].children.summary.restingCount,
}

/** Draw one cell inside the shared signal surface. */
const courseSignalCard = (stat: CourseStat, isLoading: boolean) => {
    const slots = {
        label: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: stat.label, size: "xs", tone: "muted" }} isLoading={isLoading} />
        )),
        value: defineLeafComponent("text", { size: "sm", weight: "medium" }, () => (
            <Text props={{ content: stat.value, size: "sm", weight: "medium" }} isLoading={isLoading} />
        )),
    }

    return defineContractComponent("course-signal-card-neutral", slots)
}

/**
 * THE JOINED LISTS STAND ON A BRANCH-DRAWN SURFACE, NOT ON THEIR OWN PAINT.
 *
 * Both runs are separated lists whose entry names its own element - a `ul` of promises, an `ol` of
 * modules - so the surface cannot come from `SurfaceCard`, which would put the ground on a `div` and
 * take the list with it. `SurfaceListCard` keeps the entry's host inside the card, which is the
 * whole reason it exists. The section above already names each run, so the label travels as data and
 * is not drawn twice.
 */

/** What the prerequisite list draws inside the surface branch body. */
type CoursePrerequisiteListData = SurfaceListCardData & {
    /** The requirements, in the order the course stores them. */
    readonly prerequisites: ReadonlyArray<CoursePrerequisite>
}

/** The ordered run of requirements, drawn inside the surface branch body. */
const CoursePrerequisiteListView = ({ props }: LeafProps<CoursePrerequisiteListData>) => (
    <CoursePrerequisiteListBase state="required" props={{ prerequisites: props.prerequisites }} />
)

/** Stable component type branded for the exact prerequisite contract it implements. */
const CoursePrerequisiteList = defineContractComponent("course-prerequisite-list", CoursePrerequisiteListView)

/**
 * Draw the course landing.
 *
 * @param input - {@link CourseDetailPageProps}
 */
export const CourseDetailPageBase = (input: CourseDetailPageProps) => {
    if (input.pageState === "not-found" || input.pageState === "failed") {
        return (
            <EmptyNotice
                props={{
                    icon: "course",
                    message: input.props.noticeMessage ?? "",
                    // Not-found is final: there is no retry that could change the answer, and an
                    // action that cannot help is worse than none. Failed is a request that may yet
                    // succeed, so only that one offers a way out.
                    actionLabel: input.pageState === "failed" ? input.props.noticeActionLabel : undefined,
                }}
                on={{ act: input.on?.retry }}
            />
        )
    }

    const isLoading = input.pageState === "pending"
    // A resting row carries no values - those are exactly what is still unknown - but it keeps an
    // identity, so React can key the run without reordering it on settle. A resting disclosure is
    // disabled until its source-backed description arrives.
    const stats: ReadonlyArray<CourseStat> = isLoading
        ? Array.from({ length: RESTING.stats }, (_unused, index) => ({
            id: `resting-${index + 1}`,
            label: "",
            value: "",
        }))
        : input.props.stats ?? []
    const valueProps: ReadonlyArray<string> = isLoading
        ? Array.from({ length: RESTING.promises }, () => "")
        : input.props.valueProps ?? []
    const modules: ReadonlyArray<CourseModule> = isLoading
        ? Array.from({ length: RESTING.modules }, (_unused, index) => ({
            id: `resting-module-${index + 1}`,
            title: "",
            level: "foundation",
            levelLabel: "",
            summary: "",
            description: "",
            previews: [],
        }))
        : input.props.modules ?? []
    // A resting prerequisite list rests at the same count the entry declares, so nothing moves
    // when the real requirements land.
    const prerequisites: ReadonlyArray<CoursePrerequisite> = isLoading
        ? Array.from({ length: RESTING.prerequisites }, (_unused, index) => ({ id: `resting-${index + 1}`, requirement: "" }))
        : input.props.prerequisites ?? []
    const reviews: ReadonlyArray<CourseReview> = isLoading ? [] : input.props.reviews ?? []
    const faqs: ReadonlyArray<CourseFaq> = isLoading
        ? Array.from({ length: RESTING.faqs }, (_unused, index) => ({ id: `resting-faq-${index + 1}`, title: "", description: "" }))
        : input.props.faqs ?? []

    const hero = defineContractComponent("course-hero", {
        trail: defineLeafComponent("breadcrumbs", {}, () => (
            <Breadcrumbs
                props={{
                    label: input.props.labels.breadcrumbLabel,
                    steps: [
                        { id: "home", label: input.props.labels.breadcrumbHome },
                        { id: "courses", label: input.props.labels.breadcrumbCourses },
                        { id: "course", label: input.props.title ?? "" },
                    ],
                }}
                on={{ home: input.on?.navigateHome, courses: input.on?.navigateCourses }}
                isLoading={isLoading}
            />
        )),
        heading: defineContractComponent("course-hero-heading", {
            identity: defineContractComponent("course-hero-title-stack", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.title, level: 1 }} isLoading={isLoading} />
                )),
                tagline: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: input.props.tagline, size: "sm" }} isLoading={isLoading} />
                )),
            }),
        }),
        evidence: defineContractProjection("course-signal-board", () => (
            <SurfaceCard
                contract="course-signal-board"
                render={defineContractComponent("course-signal-board", {
                    signal: stats.map((stat) => courseSignalCard(stat, isLoading)),
                })}
            />
        )),
        section: [
            defineContractProjection("marked-row-list", () => (
                <SurfaceListCard
                    contract="marked-row-list"
                    render={CourseValuePropositionList}
                    props={{ label: input.props.labels.valuePropsTitle, promises: valueProps }}
                    isLoading={isLoading}
                />
            )),
            defineContractProjection("course-prerequisite-list", () => (
                <SurfaceListCard
                    contract="course-prerequisite-list"
                    render={CoursePrerequisiteList}
                    props={{ label: input.props.labels.prerequisitesTitle, prerequisites }}
                    isLoading={isLoading}
                />
            )),
            defineContractProjection("course-curriculum-accordion", () => (
                <CourseCurriculumAccordion
                    props={{ label: input.props.labels.curriculumTitle, modules }}
                    isLoading={isLoading}
                />
            )),
            defineContractComponent("course-section", {
                title: defineLeafComponent("heading", {}, () => (
                    <Heading props={{ content: input.props.labels.reviewsTitle, level: 2 }} />
                )),
                body: defineContractProjection("course-review-block", () => (
                    <CourseReviewBlockBase
                        state={reviewStateOf(input.props.reviewTotal)}
                        props={{
                            averageScore: input.props.averageScore ?? 0,
                            total: input.props.reviewTotal ?? 0,
                            reviews,
                            countLabel: input.props.labels.reviewCount,
                            emptyLabel: input.props.labels.reviewsEmpty,
                        }}
                    />
                )),
            }),
            defineContractProjection("title-description-accordion", () => (
                <TitleDescriptionAccordion
                    props={{ label: input.props.labels.faqTitle, items: faqs, emptyLabel: input.props.labels.faqEmpty }}
                    isLoading={isLoading}
                />
            )),
        ],
    })

    return (
        <Tree
            contract="course-detail-page"
            render={defineContractComponent("course-detail-page", {
                navigation: defineContractComponent("course-section-navigation", {
                    tabs: defineLeafComponent("choice-tabs", {}, () => (
                        <ChoiceTabs
                            props={{
                                label: input.props.labels.sectionTabsLabel,
                                selectedKey: input.props.selectedSection ?? "overview",
                                tabs: [
                                    { id: "overview", label: input.props.labels.overviewTab },
                                    { id: "curriculum", label: input.props.labels.curriculumTab },
                                    { id: "reviews", label: input.props.labels.reviewsTab },
                                    { id: "faq", label: input.props.labels.faqTab },
                                ],
                            }}
                            on={{ select: (key) => input.on?.selectSection?.(key as CourseDetailSection) }}
                        />
                    )),
                }),
                body: defineContractComponent("main-then-rail", {
                    main: hero,
                    rail: defineContractProjection("course-pricing-rail", () => <CoursePricingRail displayId={input.displayId} />),
                }),
                action: defineContractProjection("course-mobile-action-bar", () => <CoursePricingRailMobile displayId={input.displayId} />),
            })}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "courses" } as const
