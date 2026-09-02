"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import {
    useMutatePurchaseProSubscriptionSwr,
    useQueryMyProSubscriptionSwr,
    useQueryProOfferSwr,
} from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { useGraphQLWithToast } from "@/modules/toast/hooks"
import { ProSubscriptionBlockBase, type ProPurchaseState } from "./component"

/** Empty route-owned input; all facts resolve from hooks. */
export type ProSubscriptionBlockProps = Record<never, never>

/** Connect public offer, authenticated lifecycle, and PayOS handoff to the Pro surface. */
export const ProSubscriptionBlock = (props: ProSubscriptionBlockProps) => {
    void props
    const t = useTranslations("proSubscription")
    const locale = useLocale()
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = useSessionToken()
    const isSignedOut = token === undefined
    const isPaymentReturn = searchParams.get("payment") === "return"
    const isPaymentCancelled = searchParams.get("payment") === "cancel"
    const offer = useQueryProOfferSwr()
    const subscription = useQueryMyProSubscriptionSwr({ refreshInterval: isPaymentReturn ? 3000 : 0 })
    const purchase = useMutatePurchaseProSubscriptionSwr()
    const runGraphQL = useGraphQLWithToast()
    const [isPaymentOpen, setIsPaymentOpen] = useState(false)
    const [hasCheckoutFailed, setHasCheckoutFailed] = useState(false)
    const isActive = subscription.data?.active === true
    const purchaseState: ProPurchaseState = isActive
        ? "active"
        : isPaymentReturn
            ? "verification-pending"
            : isPaymentCancelled
                ? "cancelled"
                : "eligible"
    const isLoading = offer.isLoading || (!isSignedOut && subscription.isLoading)
    const isFailed = offer.error !== undefined
        || offer.data === null
        || (!isSignedOut && subscription.error !== undefined)
        || offer.data?.enabled === false
    const money = new Intl.NumberFormat(locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 })
    const price = offer.data === null || offer.data === undefined ? undefined : money.format(offer.data.priceVnd)
    const end = subscription.data?.subscription?.currentPeriodEnd
    const activeUntil = end === undefined
        ? undefined
        : t("activeUntil", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date(end)) })
    const benefits = (["learning", "practice", "community", "career"] as const).map((id) => ({
        title: t(`benefits.${id}.title`),
        description: t(`benefits.${id}.description`),
    }))
    const openPurchase = () => {
        if (isSignedOut) {
            router.push("/authentication")
            return
        }
        setHasCheckoutFailed(false)
        setIsPaymentOpen(true)
    }
    const pay = () => {
        if (purchase.isMutating || isActive) return
        setHasCheckoutFailed(false)
        const route = `${window.location.origin}/${locale}/subscriptions`
        let checkoutUrl: string | undefined
        void runGraphQL(async () => {
            const result = await purchase.trigger({
                paymentType: "payos",
                payosReturnUrl: `${route}?payment=return`,
                payosCancelUrl: `${route}?payment=cancel`,
            })
            const response = result?.data?.purchaseProSubscription
            if (response === undefined) throw new Error(result?.error?.message ?? t("payment.failedMessage"))
            checkoutUrl = response.data?.checkoutUrl
            return response
        }, { showSuccessToast: false }).then((success) => {
            if (success && checkoutUrl !== undefined && checkoutUrl !== "") {
                window.location.assign(checkoutUrl)
                return
            }
            setHasCheckoutFailed(true)
        })
    }
    const summary = {
        subtotal: t("payment.subtotal"),
        savings: t("payment.savings"),
        surcharge: t("payment.surcharge"),
        total: t("payment.total"),
        unavailable: "—",
    }
    return (
        <ProSubscriptionBlockBase
            blockState={isFailed ? "failed" : isLoading ? "pending" : "ready"}
            data={{
                planName: offer.data?.displayName ?? t("planName"),
                price,
                purchaseState,
                isSignedOut,
                labels: {
                    breadcrumbLabel: t("breadcrumbLabel"), breadcrumbHome: t("breadcrumbHome"), breadcrumbCurrent: t("breadcrumbCurrent"),
                    title: t("title"), description: t("description"),
                    benefitsTitle: t("benefitsTitle"), benefitsDescription: t("benefitsDescription"), journeyAlt: t("journeyAlt"), disclosuresTitle: t("disclosuresTitle"), benefits,
                    aiTitle: t("aiTitle"), aiDescription: t("aiDescription"),
                    activationTitle: t("activationTitle"), activationDescription: t("activationDescription"),
                    planBadge: t("planBadge"), period: t("period"), renewalNote: t("renewalNote"),
                    signedOutAction: t("signedOutAction"), signedOutHelper: t("signedOutHelper"),
                    purchaseAction: t("purchaseAction", { price: price ?? "" }),
                    pendingTitle: t("pendingTitle"), pendingDescription: t("pendingDescription"),
                    activeTitle: t("activeTitle"), activeDescription: t("activeDescription"), activeUntil,
                    cancelledMessage: t("cancelledMessage"), failedTitle: t("failedTitle"),
                    failedDescription: t("failedDescription"), retry: t("retry"),
                },
                payment: {
                    isOpen: isPaymentOpen,
                    subtotal: price,
                    total: price,
                    isPaying: purchase.isMutating,
                    hasFailed: hasCheckoutFailed,
                    labels: {
                        title: t("payment.title"), subtitle: t("payment.subtitle"),
                        methodTitle: t("payment.methodTitle"), provider: t("payment.provider"),
                        providerDescription: t("payment.providerDescription"), summary,
                        processTitle: t("payment.processTitle"), handoffStep: t("payment.handoffStep"),
                        verificationStep: t("payment.verificationStep"), accessStep: t("payment.accessStep"),
                        trustNote: t("payment.trustNote"), action: t("payment.action"),
                        cancel: t("payment.cancel"), close: t("payment.close"),
                        failedMessage: t("payment.failedMessage"),
                    },
                },
            }}
            on={{
                goHome: () => router.push("/"),
                purchase: openPurchase,
                retry: () => { void offer.mutate(); if (!isSignedOut) void subscription.mutate() },
                pay,
                dismissPayment: () => { if (!purchase.isMutating) setIsPaymentOpen(false) },
            }}
        />
    )
}

export { ProSubscriptionBlockBase } from "./component"
export type { ProSubscriptionBlockData, ProSubscriptionBlockActions, ProSubscriptionBlockLabels } from "./component"
