"use client"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useRouter } from "@/i18n/navigation"
import {
    useMutateAddToCartSwr,
    useMutateCoursesCheckoutSwr,
    useMutateRemoveFromCartSwr,
    useMutateStartTrialSwr,
    useQueryCourseReviewsSwr,
    useQueryCourseSwr,
    useQueryMyCartSwr,
} from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { _CourseDetailPage, type CourseDetailSection } from "./component"
import type { CourseDetail, CourseModule } from "@/modules/api/graphql/queries/types/course"

/**
 * The connected half: resolve one course and hand the presentational half a settled situation.
 *
 * IT RESOLVES EVERY STRING BEFORE IT CROSSES. The pure half takes already-formatted copy and
 * already-formatted money, which is what lets it be rendered from a fixture in review and from the
 * API in production without knowing the difference.
 *
 * THE TRUST CHIPS ARE SUMMED HERE, from the course's own modules, exactly as the legacy page does.
 * They are therefore facts about this course rather than a second source that could disagree with
 * the curriculum below them.
 */

/** Props the route hands down. */
export interface CourseDetailPageProps {
    /**
     * The short human-facing identifier from the URL - `fullstack-mastery`.
     *
     * It must be the display id: the server resolves a course by that and, despite `CourseRequest`
     * also declaring `id`, answers a primary-key lookup with COURSE_NOT_FOUND_EXCEPTION. A link
     * built from `course.id` therefore reaches the not-found notice.
     */
    displayId: string
}

/** Sum a number across every content of every module. */
const sumContents = (modules: ReadonlyArray<CourseModule>, read: (content: { minutesRead: number, numChallenges: number }) => number): number =>
    modules.reduce((total, module) => total + (module.contents ?? []).reduce((inner, content) => inner + read(content), 0), 0)

/** Order by the course's own declaration order rather than the transport's arrival order. */
const byOrder = <T extends { orderIndex: number }>(rows: ReadonlyArray<T>) =>
    [...rows].sort((left, right) => left.orderIndex - right.orderIndex)

/**
 * Fetch and resolve one course.
 *
 * @param input - {@link CourseDetailPageProps}
 */
export const CourseDetailPage = (input: CourseDetailPageProps) => {
    const t = useTranslations("courses.detail")
    const tCourses = useTranslations("courses")
    const tCatalog = useTranslations("courses.catalog")
    const tCart = useTranslations("cart")
    const locale = useLocale()
    const router = useRouter()
    const [selectedSection, setSelectedSection] = useState<CourseDetailSection>("overview")
    const { mutate } = useSWRConfig()
    const sessionToken = useSessionToken()
    const query = useQueryCourseSwr({ displayId: input.displayId })
    const cartQuery = useQueryMyCartSwr()
    const adding = useMutateAddToCartSwr(query.data?.id)
    const removing = useMutateRemoveFromCartSwr(query.data?.id)
    const checkout = useMutateCoursesCheckoutSwr()
    const trial = useMutateStartTrialSwr(query.data?.id)
    // The rating is a second request on purpose: it is public, shared by every reader and
    // invalidated by a different event than the course itself, so folding it into the course
    // query would make one cache entry answer two questions that change at different times.
    const reviewQuery = useQueryCourseReviewsSwr(query.data?.id)
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })

    const labels = {
        breadcrumbLabel: t("breadcrumbLabel"),
        breadcrumbHome: t("breadcrumbHome"),
        breadcrumbCourses: t("breadcrumbCourses"),
        sectionTabsLabel: t("sectionTabsLabel"),
        overviewTab: t("overviewTab"),
        curriculumTab: t("curriculumTab"),
        reviewsTab: t("reviewsTab"),
        faqTab: t("faqTab"),
        valuePropsTitle: t("valuePropsTitle"),
        curriculumTitle: t("curriculumTitle"),
        prerequisitesTitle: t("prerequisitesTitle"),
        reviewsTitle: t("reviewsTitle"),
        reviewsEmpty: t("reviewsEmpty"),
        faqTitle: t("faqTitle"),
        faqEmpty: t("faqEmpty"),
        reviewCount: t("reviewCount", { count: reviewQuery.data?.total ?? 0 }),
    }

    if (query.error !== undefined && query.data === undefined) {
        return (
            <_CourseDetailPage
                state="failed"
                props={{ labels, noticeMessage: t("failed"), noticeActionLabel: t("retry") }}
                on={{ retry: () => { void query.mutate() } }}
            />
        )
    }
    if (query.data === undefined) return <_CourseDetailPage state="pending" props={{ labels }} />
    if (query.data === null) return <_CourseDetailPage state="not-found" props={{ labels, noticeMessage: t("notFound") }} />

    const course: CourseDetail = query.data
    const modules = byOrder(course.modules ?? [])
    const phases = byOrder(course.pricingPhases ?? [])
    const openPhase = phases.find((phase) => phase.phase === course.currentPhase)

    // The payable price IS the open phase's price. Falling back to the list price when no phase is
    // open is not a guess: a course with no phase ladder sells at its list price, which is the same
    // number the ladder would have shown.
    const payable = openPhase?.price ?? course.originalPrice
    const isPaid = payable > 0
    const isInCart = (cartQuery.data ?? []).some((row) => row.courseId === course.id)
    const hasDiscount = payable < course.originalPrice
    const discountPercent = hasDiscount ? Math.round((1 - payable / course.originalPrice) * 100) : 0

    const selectSection = (section: CourseDetailSection) => {
        setSelectedSection(section)
        const sections = document.querySelectorAll<HTMLElement>("[data-node=\"course-section\"]")
        const target = section === "overview"
            ? document.querySelector<HTMLElement>("[data-node=\"course-hero-heading\"]")
            : section === "curriculum" ? sections.item(2)
                : section === "reviews" ? sections.item(3) : sections.item(4)
        target?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <_CourseDetailPage
            state="ready"
            props={{
                labels,
                selectedSection,
                title: course.title,
                tagline: course.description,
                stats: [
                    {
                        id: "learners",
                        label: t("learnerSignalLabel"),
                        value: t("statLearners", { count: course.enrollmentCount }),
                    },
                    {
                        id: "modules",
                        label: t("moduleSignalLabel"),
                        value: t("statModules", { count: modules.length }),
                    },
                    // Counted from the contents themselves, NOT from `numContents`. The served
                    // schema exposes that field and returns zero for it on this query path, so the
                    // chip claimed no lessons beside a curriculum listing twenty-three modules.
                    // The rows are already selected for the hours chip; counting them is the same
                    // source answering the same question.
                    {
                        id: "hours",
                        label: t("hourSignalLabel"),
                        value: t("statHours", { count: Math.round(sumContents(modules, (content) => content.minutesRead) / 60) }),
                    },
                    {
                        id: "contents",
                        label: t("contentSignalLabel"),
                        value: t("statContents", { count: sumContents(modules, () => 1) }),
                    },
                    {
                        id: "challenges",
                        label: t("challengeSignalLabel"),
                        value: t("statChallenges", { count: sumContents(modules, (content) => content.numChallenges) }),
                    },
                    {
                        id: "rating",
                        label: t("reviewCount", { count: reviewQuery.data?.total ?? 0 }),
                        value: reviewQuery.data?.averageScore?.toFixed(1) ?? "—",
                    },
                ],
                valueProps: byOrder(course.valuePropositions ?? []).map((proposition) => proposition.text),
                faqs: byOrder(course.qnas ?? []).map((faq) => ({
                    id: faq.id,
                    question: faq.question,
                    answer: faq.answer,
                })),
                // Ordered by the backend and read that way here: a learner who lacks the first
                // requirement cannot judge the second, so arrival order is not good enough.
                // The mean and the total describe the WHOLE population and come from the
                // projection; the nodes are one page. Deriving the mean from the nodes would
                // answer a different question and change on every page turn.
                averageScore: reviewQuery.data?.averageScore,
                reviewTotal: reviewQuery.data?.total,
                reviews: (reviewQuery.data?.nodes ?? []).map((row) => ({
                    id: row.id,
                    // A UUID is storage identity, not a public learner name. Until the public
                    // author projection is available, use a localized neutral label.
                    author: t("reviewsAnonymous"),
                    score: row.score,
                    body: row.body ?? undefined,
                })),
                prerequisites: byOrder(course.prerequisites ?? []).map((row, index) => ({
                    id: `prerequisite-${index + 1}`,
                    requirement: row.text,
                })),
                modules: modules.map((module) => {
                    const previews = byOrder(module.previewContents ?? [])
                    return {
                        id: module.id,
                        title: module.title,
                        level: module.contentTier,
                        levelLabel: t(`tier.${module.contentTier}`),
                        previewLabel: previews.length === 0 ? undefined : t("previewCount", { count: previews.length }),
                        // A preview bullet IS the thing the disclosure reveals, and every one of
                        // them is previewable by definition - that is what makes it a preview.
                        lessons: previews.map((preview) => ({ id: preview.id, title: preview.text, isPreview: true })),
                    }
                }),
                rail: {
                    coverUrl: course.coverImageUrl ?? null,
                    title: course.title,
                    price: money.format(payable),
                    originalPrice: hasDiscount ? money.format(course.originalPrice) : undefined,
                    discountLabel: hasDiscount ? `−${discountPercent}%` : undefined,
                    savingsLabel: hasDiscount ? t("savings", { amount: money.format(course.originalPrice - payable) }) : undefined,
                    scarcityLabel: openPhase === undefined || openPhase.slotAvailable <= 0
                        ? undefined
                        : t("scarcity", { count: openPhase.slotAvailable, phase: t(`phase.${openPhase.phase}`) }),
                    phases: phases.map((phase) => ({
                        id: phase.id,
                        name: t(`phase.${phase.phase}`),
                        // The OPEN phase shows that it is open rather than repeating its price -
                        // the price is already the headline above, and a ladder that restates it
                        // reads as two prices.
                        value: phase.phase === course.currentPhase ? t("phaseOpen") : money.format(phase.price),
                        isActive: phase.phase === course.currentPhase,
                    })),
                    // An enrolled viewer continues; everyone else enrols. `isEnrolled` is null for a
                    // guest, which is neither - and a guest is asked to enrol, because that is the
                    // action the page can actually offer them.
                    ctaLabel: course.isEnrolled === true ? t("continue") : t("enroll"),
                    trialLabel: course.isEnrolled === true ? undefined : tCourses("trial"),
                    cartLabel: course.isEnrolled === true || !isPaid
                        ? undefined
                        : isInCart ? tCart("remove") : tCatalog("addToCart"),
                    isInCart,
                    enrolmentLabel: t("enrolled", { count: course.enrollmentCount }),
                },
                railState: checkout.isMutating
                    ? "checking-out"
                    : trial.isMutating
                        ? "trialing"
                        : adding.isMutating || removing.isMutating
                            ? "adding"
                            : "ready",
            }}
            on={{
                act: () => {
                    if (course.isEnrolled === true) {
                        router.push(`/courses/${course.displayId}/learn/content`)
                        return
                    }
                    if (sessionToken === undefined) {
                        router.push("/authentication")
                        return
                    }
                    const here = window.location.href
                    void checkout.trigger({
                        courseIds: [course.id],
                        paymentType: "payos",
                        returnUrl: here,
                        cancelUrl: here,
                    }).then((result) => {
                        const url = result?.data?.coursesCheckout?.data?.checkoutUrl
                        if (typeof url === "string" && url !== "") window.location.assign(url)
                    })
                },
                trial: () => {
                    if (sessionToken === undefined) {
                        router.push("/authentication")
                        return
                    }
                    void trial.trigger({ courseId: course.id }).then((result) => {
                        if (result?.data?.startTrial?.success !== true) return
                        router.push(`/courses/${course.displayId}/learn/content`)
                    }).catch(() => undefined)
                },
                addToCart: () => {
                    if (sessionToken === undefined) {
                        router.push("/authentication")
                        return
                    }
                    const operation = isInCart
                        ? removing.trigger({ courseId: course.id }).then((result) => result?.data?.removeFromCart?.success)
                        : adding.trigger({ courseId: course.id }).then((result) => result?.data?.addToCart?.success)
                    void operation.then((success) => {
                        if (success !== true) return
                        void mutate((key) => Array.isArray(key) && key[0] === QUERY_MY_CART_SWR_KEY[0])
                    })
                },
                navigateHome: () => { router.push("/") },
                navigateCourses: () => { router.push("/courses") },
                selectSection,
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const
