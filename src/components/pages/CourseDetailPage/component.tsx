import { CoursePrerequisiteListBase, type CoursePrerequisite } from "@/components/blocks/courses/CoursePrerequisiteList/component"
import { CourseReviewBlockBase, type CourseReview } from "@/components/blocks/courses/CourseReviewBlock/component"
import { CourseValuePropositionList } from "@/components/blocks/courses/CourseValuePropositionList/component"
import { CoursePricingRail, CoursePricingRailMobile } from "@/components/blocks/courses/CoursePricingRail"
import { CourseCurriculumAccordion, type CourseCurriculumModule } from "@/components/composites/CourseCurriculumAccordion"
import { TitleDescriptionAccordion, type TitleDescriptionAccordionItem } from "@/components/composites/TitleDescriptionAccordion"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Text } from "@/components/leaves/Text"

/** One trust statistic shown in the course hero. */
export type CourseStat = { readonly id: string; readonly label: string; readonly value: string }
/** Sections reachable from the course navigation. */
export type CourseDetailSection = "overview" | "curriculum" | "reviews" | "faq"
/** One authored FAQ item. */
export type CourseFaq = TitleDescriptionAccordionItem
/** One curriculum module. */
export type CourseModule = CourseCurriculumModule
/** Resolved labels used by the course surface. */
export type CourseDetailLabels = {
    readonly breadcrumbLabel: string; readonly breadcrumbHome: string; readonly breadcrumbCourses: string
    readonly sectionTabsLabel: string; readonly overviewTab: string; readonly curriculumTab: string
    readonly reviewsTab: string; readonly faqTab: string; readonly valuePropsTitle: string
    readonly curriculumTitle: string; readonly prerequisitesTitle: string; readonly reviewsTitle: string
    readonly reviewsEmpty: string; readonly faqTitle: string; readonly faqEmpty: string; readonly reviewCount: string
}
/** Resolved course detail data. */
export type CourseDetailPageData = {
    readonly labels: CourseDetailLabels; readonly selectedSection?: CourseDetailSection; readonly title?: string; readonly tagline?: string
    readonly stats?: ReadonlyArray<CourseStat>; readonly valueProps?: ReadonlyArray<string>; readonly prerequisites?: ReadonlyArray<CoursePrerequisite>
    readonly reviews?: ReadonlyArray<CourseReview>; readonly faqs?: ReadonlyArray<CourseFaq>; readonly averageScore?: number; readonly reviewTotal?: number
    readonly modules?: ReadonlyArray<CourseModule>; readonly noticeMessage?: string; readonly noticeActionLabel?: string
}
/** Course page actions. */
export type CourseDetailPageActions = { readonly navigateHome?: () => void; readonly navigateCourses?: () => void; readonly selectSection?: (section: CourseDetailSection) => void; readonly retry?: () => void }
/** Course page state. */
export type CourseDetailPageState = "pending" | "ready" | "not-found" | "failed"
/** Props for the course detail surface. */
export type CourseDetailPageProps = { readonly displayId: string; readonly pageState: CourseDetailPageState; readonly props: CourseDetailPageData; readonly on?: CourseDetailPageActions }

const RESTING_COUNTS = { stats: 5, promises: 4, modules: 3, prerequisites: 3, faqs: 3 } as const
const reviewStateOf = (total: number | undefined): "unrated" | "rated" => (total ?? 0) === 0 ? "unrated" : "rated"

/** Draw the course detail page with ordinary React composition. */
export const CourseDetailPageBase = (props: CourseDetailPageProps) => {
    if (props.pageState === "not-found" || props.pageState === "failed") return <EmptyNotice props={{ icon: "course", message: props.props.noticeMessage ?? "", actionLabel: props.pageState === "failed" ? props.props.noticeActionLabel : undefined }} on={{ act: props.on?.retry }} />
    const isLoading = props.pageState === "pending"
    const stats = isLoading ? Array.from({ length: RESTING_COUNTS.stats }, (_, index) => ({ id: `resting-${index}`, label: "", value: "" })) : props.props.stats ?? []
    const valueProps = isLoading ? Array.from({ length: RESTING_COUNTS.promises }, () => "") : props.props.valueProps ?? []
    const modules = isLoading ? Array.from({ length: RESTING_COUNTS.modules }, (_, index) => ({ id: `resting-module-${index}`, title: "", level: "foundation" as const, levelLabel: "", summary: "", description: "", previews: [] })) : props.props.modules ?? []
    const prerequisites = isLoading ? Array.from({ length: RESTING_COUNTS.prerequisites }, (_, index) => ({ id: `resting-${index}`, requirement: "" })) : props.props.prerequisites ?? []
    const reviews = isLoading ? [] : props.props.reviews ?? []
    const faqs = isLoading ? Array.from({ length: RESTING_COUNTS.faqs }, (_, index) => ({ id: `resting-faq-${index}`, title: "", description: "" })) : props.props.faqs ?? []
    return <>
        <Breadcrumbs props={{ label: props.props.labels.breadcrumbLabel, steps: [{ id: "home", label: props.props.labels.breadcrumbHome }, { id: "courses", label: props.props.labels.breadcrumbCourses }, { id: "course", label: props.props.title ?? "" }] }} on={{ home: props.on?.navigateHome, courses: props.on?.navigateCourses }} isLoading={isLoading} />
        <header id="course-detail-overview">
            <Heading props={{ content: props.props.title ?? "", level: 1 }} isLoading={isLoading} />
            <Text props={{ content: props.props.tagline ?? "", size: "sm" }} isLoading={isLoading} />
        </header>
        <section aria-label={props.props.labels.valuePropsTitle}>
            {stats.map((stat) => <div key={stat.id}><Text props={{ content: stat.label, size: "xs", tone: "muted" }} isLoading={isLoading} /><Text props={{ content: stat.value, size: "sm", weight: "medium" }} isLoading={isLoading} /></div>)}
        </section>
        <ChoiceTabs props={{ label: props.props.labels.sectionTabsLabel, selectedKey: props.props.selectedSection ?? "overview", tabs: [{ id: "overview", label: props.props.labels.overviewTab }, { id: "curriculum", label: props.props.labels.curriculumTab }, { id: "reviews", label: props.props.labels.reviewsTab }, { id: "faq", label: props.props.labels.faqTab }] }} on={{ select: (key) => props.on?.selectSection?.(key as CourseDetailSection) }} />
        <main>
            <section><Heading props={{ content: props.props.labels.valuePropsTitle, level: 2 }} /><CourseValuePropositionList props={{ label: props.props.labels.valuePropsTitle, promises: valueProps }} isLoading={isLoading} /></section>
            <section><Heading props={{ content: props.props.labels.prerequisitesTitle, level: 2 }} /><CoursePrerequisiteListBase state={prerequisites.length === 0 ? "none" : "required"} props={{ prerequisites }} /></section>
            <section id="course-detail-curriculum"><CourseCurriculumAccordion props={{ label: props.props.labels.curriculumTitle, modules }} isLoading={isLoading} /></section>
            <section id="course-detail-reviews"><Heading props={{ content: props.props.labels.reviewsTitle, level: 2 }} /><CourseReviewBlockBase state={reviewStateOf(props.props.reviewTotal)} props={{ averageScore: props.props.averageScore ?? 0, total: props.props.reviewTotal ?? 0, reviews, countLabel: props.props.labels.reviewCount, emptyLabel: props.props.labels.reviewsEmpty }} /></section>
            <section id="course-detail-faq"><TitleDescriptionAccordion props={{ label: props.props.labels.faqTitle, items: faqs, emptyLabel: props.props.labels.faqEmpty }} isLoading={isLoading} /></section>
        </main>
        <aside><CoursePricingRail displayId={props.displayId} /></aside>
        <CoursePricingRailMobile displayId={props.displayId} />
    </>
}
