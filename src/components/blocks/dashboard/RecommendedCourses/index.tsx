"use client"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryRecommendedCoursesSwr } from "@/hooks"
import { RecommendedCoursesBase } from "./component"

/** What the surrounding tab owns: which course is currently explaining its price. */
export type RecommendedCoursesRouteProps = {
    /**
     * Called when a reader asks why a suggested course costs what it costs.
     *
     * The covering surface is NOT mounted here. A connected block renders its own pure twin and
     * nothing else, and one overlay per row would be one focus trap per row, so the block reports
     * which course was asked about and the tab holding the list mounts the single surface.
     */
    readonly onOpenPriceDetail?: (courseId: string) => void
}

/**
 * Fetch and resolve recommended courses for the dashboard.
 *
 * @param props - {@link RecommendedCoursesRouteProps}
 */
export const RecommendedCourses = (props: RecommendedCoursesRouteProps = {}) => {
    const { onOpenPriceDetail } = props
    const t = useTranslations("courses.recommended")
    // The question beside a price is the same sentence the catalog asks, so it is read from the one
    // place that owns it rather than translated a second time under this block's own namespace.
    const tCatalog = useTranslations("courses.catalog")
    const locale = useLocale()
    const router = useRouter()
    const query = useQueryRecommendedCoursesSwr()
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const items = query.data ?? []

    const rows = items.map((item) => ({
        id: item.displayId,
        title: item.title,
        // The artwork identifies the course faster than its title does, which is what the mark is
        // for. The description it replaces was a paragraph inside a row nobody stops to read.
        cover: item.thumbnailUrl ?? null,
        price: money.format(item.discountedPriceVnd),
        ...(item.discountPercent > 0
            ? {
                originalPrice: money.format(item.originalPriceVnd),
                discount: `−${item.discountPercent}%`,
                savings: tCatalog("savings", {
                    amount: money.format(item.originalPriceVnd - item.discountedPriceVnd),
                }),
            }
            : {}),
        priceDetailLabel: tCatalog("priceDetail"),
        reason: item.discountReason === "none" ? undefined : t("reason", { count: item.enrolledCount }),
    }))

    const viewProps = { label: t("heading"), rows, errorMessage: t("failed"), retryLabel: t("retry") }

    if (query.error !== undefined && query.data === undefined) {
        return <RecommendedCoursesBase state="failed" props={viewProps} on={{ retry: () => { void query.mutate() } }} />
    }
    if (query.data === undefined) return <RecommendedCoursesBase state="pending" props={viewProps} />
    if (rows.length === 0) return <RecommendedCoursesBase state="hidden" props={viewProps} />

    return (
        <RecommendedCoursesBase
            state="ready"
            props={viewProps}
            on={{
                ...Object.fromEntries(rows.map((row) => [`open:${row.id}`, () => router.push(`/courses/${row.id}`)])),
                ...Object.fromEntries(rows.map((row) => [`priceDetail:${row.id}`, () => onOpenPriceDetail?.(row.id)])),
            }}
        />
    )
}
