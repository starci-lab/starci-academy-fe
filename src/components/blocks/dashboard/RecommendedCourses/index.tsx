"use client"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useQueryRecommendedCoursesSwr } from "@/hooks"
import { _RecommendedCourses } from "./component"
/** Fetch and resolve recommended courses for the dashboard. */
export const RecommendedCourses = () => { const t = useTranslations("courses.recommended"); const locale = useLocale(); const router = useRouter(); const query = useQueryRecommendedCoursesSwr(); const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 }); const items = query.data ?? []; const rows = items.map((item) => ({ id: item.displayId, title: item.title, description: item.description ?? undefined, price: money.format(item.discountedPriceVnd), originalPrice: item.discountPercent > 0 ? money.format(item.originalPriceVnd) : undefined, discount: item.discountPercent > 0 ? `−${item.discountPercent}%` : undefined, reason: item.discountReason === "none" ? undefined : t("reason", { count: item.enrolledCount }) })); const props = { label: t("heading"), rows, errorMessage: t("failed"), retryLabel: t("retry") }; if(query.error !== undefined && query.data === undefined) return <_RecommendedCourses state="failed" props={props} on={{ retry: () => { void query.mutate() } }} />; if(query.data === undefined) return <_RecommendedCourses state="pending" props={props} />; if(rows.length === 0) return <_RecommendedCourses state="hidden" props={props} />; return <_RecommendedCourses state="ready" props={props} on={Object.fromEntries(rows.map((row) => [`open:${row.id}`, () => router.push(`/courses/${row.id}`)]))} /> }
/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "courses" } as const
