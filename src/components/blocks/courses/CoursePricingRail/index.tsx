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
    useQueryCoursePricePreviewSwr,
    useQueryCourseSwr,
    useQueryMyCartSwr,
} from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CoursePricingRailBase, type CoursePricingRailData, type CoursePricingRailState } from "./component"
import { isPersonalPrice } from "@/modules/utils/course-price"
import type { CourseDetail } from "@/modules/api/graphql/queries/types/course"
import type { CoursePricePreview } from "@/modules/api/graphql/queries/types/course-price-preview"

type DetailTranslator = (key: string, values?: Record<string, string | number>) => string
type OpenPhase = { readonly slotAvailable: number; readonly phase: string }

const scarcityLabelOf = (phase: OpenPhase | undefined, t: DetailTranslator) => phase === undefined || phase.slotAvailable <= 0
    ? undefined
    : t("scarcity", { count: phase.slotAvailable, phase: t(`phase.${phase.phase}`) })
const cartLabelOf = (enrolled: boolean | null | undefined, paid: boolean, inCart: boolean, tCart: DetailTranslator, tCatalog: DetailTranslator) =>
    enrolled === true || !paid ? undefined : inCart ? tCart("remove") : tCatalog("addToCart")
const railStateOf = (pricePending: boolean, checkingOut: boolean, trialing: boolean, changingCart: boolean): CoursePricingRailState => {
    if (pricePending) return "price-pending"
    if (checkingOut) return "checking-out"
    if (trialing) return "trialing"
    if (changingCart) return "adding"
    return "ready"
}
const payablePriceOf = (personal: CoursePricePreview | undefined, openPrice: number | undefined, original: number) => personal?.discountedPriceVnd ?? openPrice ?? original
const listPriceOf = (personal: CoursePricePreview | undefined, original: number) => personal?.originalPriceVnd ?? original
const discountPercentOf = (personal: CoursePricePreview | undefined, payable: number, list: number) => {
    if (personal !== undefined) return personal.discountPercent ?? 0
    return payable >= list ? 0 : Math.round((1 - payable / list) * 100)
}

type PricingRailConnectedProps = { readonly displayId: string }

const usePricingRailModel = (input: PricingRailConnectedProps) => {
    const t = useTranslations("courses.detail")
    const tCourses = useTranslations("courses")
    const tCatalog = useTranslations("courses.catalog")
    const tCart = useTranslations("cart")
    const locale = useLocale()
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const sessionToken = useSessionToken()
    const query = useQueryCourseSwr({ displayId: input.displayId })
    const cartQuery = useQueryMyCartSwr()
    const adding = useMutateAddToCartSwr(query.data?.id)
    const removing = useMutateRemoveFromCartSwr(query.data?.id)
    const checkout = useMutateCoursesCheckoutSwr()
    const trial = useMutateStartTrialSwr(query.data?.id)
    const pricePreview = useQueryCoursePricePreviewSwr(query.data?.id)
    const [isPriceDetailOpen, setIsPriceDetailOpen] = useState(false)

    const course = query.data
    if (course === undefined || course === null) return { course, data: undefined, state: "price-pending" as const, on: undefined, isPriceDetailOpen, dismissPriceDetail: () => setIsPriceDetailOpen(false) }

    const typedCourse = course as CourseDetail
    const phases = [...(typedCourse.pricingPhases ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)
    const openPhase = phases.find((phase) => phase.phase === typedCourse.currentPhase)
    const preview = pricePreview.data ?? undefined
    const personalPrice = isPersonalPrice(preview)
    const payable = payablePriceOf(personalPrice ? preview : undefined, openPhase?.price, typedCourse.originalPrice)
    const listPrice = personalPrice ? listPriceOf(preview, typedCourse.originalPrice) : typedCourse.originalPrice
    const isPaid = payable > 0
    const isInCart = (cartQuery.data ?? []).some((row) => row.courseId === typedCourse.id)
    const hasDiscount = payable < listPrice
    const discountPercent = discountPercentOf(personalPrice ? preview : undefined, payable, listPrice)
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const data: CoursePricingRailData = {
        intent: {
            intentTabsLabel: t("intentTabsLabel"), purchaseModeLabel: t("purchaseModeLabel"), trialModeLabel: t("trialModeLabel"),
            purchaseTitle: t("purchaseTitle"), purchaseDescription: t("purchaseDescription"), trialTitle: t("trialTitle"),
            trialDescription: t("trialDescription"), phaseDisclosureLabel: t("phaseDisclosureLabel"),
        },
        coverUrl: typedCourse.coverImageUrl ?? null,
        title: typedCourse.title,
        price: money.format(payable),
        originalPrice: hasDiscount ? money.format(listPrice) : undefined,
        discountLabel: hasDiscount ? `−${discountPercent}%` : undefined,
        savingsLabel: hasDiscount ? t("savings", { amount: money.format(listPrice - payable) }) : undefined,
        priceDetailLabel: tCatalog("priceDetail"),
        scarcityLabel: scarcityLabelOf(openPhase, t),
        phases: phases.map((phase) => ({ id: phase.id, name: t(`phase.${phase.phase}`), value: phase.phase === typedCourse.currentPhase ? t("phaseOpen") : money.format(phase.price), isActive: phase.phase === typedCourse.currentPhase })),
        ctaLabel: typedCourse.isEnrolled === true ? t("continue") : t("enroll"),
        trialLabel: typedCourse.isEnrolled === true ? undefined : tCourses("trial"),
        cartLabel: cartLabelOf(typedCourse.isEnrolled, isPaid, isInCart, tCart, tCatalog),
        isInCart,
        enrolmentLabel: t("enrolled", { count: typedCourse.enrollmentCount }),
    }
    const on = {
        act: () => {
            if (typedCourse.isEnrolled === true) { router.push(`/courses/${typedCourse.displayId}/learn/content`); return }
            if (sessionToken === undefined) { router.push("/authentication"); return }
            const here = window.location.href
            void checkout.trigger({ courseIds: [typedCourse.id], paymentType: "payos", returnUrl: here, cancelUrl: here }).then((result) => {
                const url = result?.data?.coursesCheckout?.data?.checkoutUrl
                if (typeof url === "string" && url !== "") window.location.assign(url)
            })
        },
        trial: () => {
            if (sessionToken === undefined) { router.push("/authentication"); return }
            void trial.trigger({ courseId: typedCourse.id }).then((result) => {
                if (result?.data?.startTrial?.success === true) router.push(`/courses/${typedCourse.displayId}/learn/content`)
            }).catch(() => undefined)
        },
        addToCart: () => {
            if (sessionToken === undefined) { router.push("/authentication"); return }
            const operation = isInCart
                ? removing.trigger({ courseId: typedCourse.id }).then((result) => result?.data?.removeFromCart?.success)
                : adding.trigger({ courseId: typedCourse.id }).then((result) => result?.data?.addToCart?.success)
            void operation.then((success) => { if (success === true) void mutate((key) => Array.isArray(key) && key[0] === QUERY_MY_CART_SWR_KEY[0]) })
        },
        openPriceDetail: () => setIsPriceDetailOpen(true),
    }
    return { course: typedCourse, data, on, state: railStateOf(pricePreview.isLoading, checkout.isMutating, trial.isMutating, adding.isMutating || removing.isMutating), isPriceDetailOpen, dismissPriceDetail: () => setIsPriceDetailOpen(false) }
}

/** Connected owner for the desktop pricing rail and its price overlay. */
export const CoursePricingRail = (input: PricingRailConnectedProps) => {
    const model = usePricingRailModel(input)
    return <CoursePricingRailBase
        state={model.state}
        props={model.data ?? { title: "", ctaLabel: "" }}
        on={model.on}
        priceOverlay={model.course === undefined || model.course === null ? undefined : {
            courseId: model.course.id,
            title: model.course.title,
            isOpen: model.isPriceDetailOpen,
            onDismiss: model.dismissPriceDetail,
        }}
    />
}

/** Same connected commerce owner projected into the narrow-screen action bar. */
export const CoursePricingRailMobile = (input: PricingRailConnectedProps) => {
    const model = usePricingRailModel(input)
    return <CoursePricingRailBase
        surface="mobile"
        state={model.state}
        props={model.data ?? { title: "", ctaLabel: "" }}
        on={model.on}
    />
}

export * from "./component"

/** Connected ownership marker for the commerce rail and its mobile projection. */
export const meta = { world: "connected", domain: "courses" } as const
