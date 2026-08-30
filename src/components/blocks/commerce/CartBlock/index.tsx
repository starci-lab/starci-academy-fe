"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useRouter } from "@/i18n/navigation"
import { useMutateClearCartSwr, useMutateCoursesCheckoutSwr, useQueryCoursesCheckoutPreviewSwr, useQueryMyCartSwr } from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CartBlockBase, type CartBlockState } from "./component"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"

/** Props for the connected cart owner; cart state is resolved from its data hooks. */
type CartBlockProps = Record<never, never>
/** Connected cart block: query, mutation, localized data and actions live here. */
/** Resolve the current cart, checkout preview and localized cart actions. */
export const CartBlock = (props: CartBlockProps) => {
    void props
    const t = useTranslations("cart")
    const tPayment = useTranslations("payment")
    const locale = useLocale()
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const [hasClearFailed, setHasClearFailed] = useState(false)
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [hasCheckoutFailed, setHasCheckoutFailed] = useState(false)
    const token = useSessionToken()
    const isSignedOut = token === undefined
    const cart = useQueryMyCartSwr()
    const courseIds = useMemo(() => (cart.data ?? []).map((row) => row.courseId), [cart.data])
    const preview = useQueryCoursesCheckoutPreviewSwr(courseIds)
    const clearing = useMutateClearCartSwr()
    const checkout = useMutateCoursesCheckoutSwr()
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const pricedBy = new Map((preview.data?.lines ?? []).map((line) => [line.courseId, line]))
    const lines: ReadonlyArray<CartLineData> = (cart.data ?? []).map((row) => {
        const priced = pricedBy.get(row.courseId)
        return {
            courseId: row.courseId,
            title: row.course.title,
            cover: row.course.coverImageUrl ?? null,
            price: priced === undefined ? undefined : money.format(priced.chargedVnd),
            originalPrice: priced === undefined || priced.listVnd <= priced.chargedVnd ? undefined : money.format(priced.listVnd),
            discountLabel: priced === undefined || priced.discountPercent <= 0 ? undefined : t("discount", { percent: priced.discountPercent }),
            removeLabel: t("remove"),
        }
    })
    const state: CartBlockState = isSignedOut ? "failed" : cart.isLoading ? "pending" : cart.error !== undefined ? "failed" : lines.length === 0 ? "empty" : "ready"
    const subtotal = preview.data === null || preview.data === undefined ? undefined : money.format(preview.data.totalListVnd)
    const savings = preview.data === null || preview.data === undefined || preview.data.savingsVnd <= 0 ? undefined : `-${money.format(preview.data.savingsVnd)}`
    const total = preview.data === null || preview.data === undefined ? undefined : money.format(preview.data.totalChargedVnd)
    const summaryLabels = { subtotal: t("subtotal"), savings: t("savings"), surcharge: t("installmentFee"), total: t("total"), unavailable: t("unavailable") }
    const pay = () => {
        if (lines.length === 0 || checkout.isMutating) return
        setHasCheckoutFailed(false)
        const here = window.location.href
        void checkout.trigger({ courseIds, paymentType: "payos", returnUrl: here, cancelUrl: here })
            .then((result) => {
                const url = result?.data?.coursesCheckout?.data?.checkoutUrl
                if (typeof url === "string" && url !== "") {
                    window.location.assign(url)
                    return
                }
                setHasCheckoutFailed(true)
            })
            .catch(() => setHasCheckoutFailed(true))
    }
    return (
        <>
            <CartBlockBase
                blockState={state}
                data={{
                    labels: {
                        navHome: t("navHome"), navCart: t("navCart"), title: t("title"),
                        summary: summaryLabels,
                        paymentHint: t("paymentHint"),
                        checkout: t("checkout", { count: lines.length }), clearAll: hasClearFailed ? t("clearFailed") : t("clearAll"), confirmClearAll: t("confirmClearAll"),
                        emptyMessage: t("emptyMessage"), failedMessage: isSignedOut ? t("signedOutMessage") : t("failedMessage"), failedAction: isSignedOut ? t("signedOutAction") : t("failedAction"), emptyAction: t("emptyAction"),
                    },
                    lines,
                    subtotal,
                    savings,
                    total,
                    hasPricingFailed: preview.error !== undefined,
                    payment: {
                        isOpen: isPaymentOpen,
                        subtotal,
                        savings,
                        total,
                        isPaying: checkout.isMutating,
                        hasFailed: hasCheckoutFailed,
                        labels: {
                            title: tPayment("title"),
                            subtitle: tPayment("subtitle", { count: lines.length }),
                            methodTitle: tPayment("methodTitle"),
                            provider: tPayment("provider"),
                            providerDescription: tPayment("providerDescription"),
                            summary: summaryLabels,
                            processTitle: tPayment("processTitle"),
                            handoffStep: tPayment("handoffStep"),
                            verificationStep: tPayment("verificationStep"),
                            accessStep: tPayment("accessStep"),
                            trustNote: tPayment("trustNote"),
                            action: tPayment("action", { total: total ?? "" }),
                            cancel: tPayment("cancel"),
                            failedMessage: tPayment("failedMessage"),
                        },
                    },
                }}
                on={{
                    checkout: () => { if (lines.length === 0) return; setHasCheckoutFailed(false); setIsPaymentOpen(true) },
                    clearAll: () => { setHasClearFailed(false); void clearing.trigger().then((result) => { if (result?.data?.clearCart?.success !== true) { setHasClearFailed(true); return }; void mutate((key) => Array.isArray(key) && key[0] === QUERY_MY_CART_SWR_KEY[0]) }) },
                    goHome: () => router.push("/dashboard"),
                    browse: () => { if (isSignedOut) { router.push("/authentication"); return }; if (state === "failed") { void cart.mutate(); return }; router.push("/courses") },
                    pay,
                    dismissPayment: () => { if (!checkout.isMutating) setIsPaymentOpen(false) },
                }}
            />
        </>
    )
}

export { CartBlockBase } from "./component"
export type { CartBlockProps, CartBlockData, CartBlockActions, CartBlockLabels } from "./component"
