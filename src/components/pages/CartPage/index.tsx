"use client"

import { useMemo, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSWRConfig } from "swr"
import { useRouter } from "@/i18n/navigation"
import {
    useMutateClearCartSwr,
    useMutateCoursesCheckoutSwr,
    useQueryCoursesCheckoutPreviewSwr,
    useQueryMyCartSwr,
} from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CartPageBase, type CartPageState } from "./component"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"

/**
 * The cart, resolved for the asking viewer.
 *
 * TWO REQUESTS, TWO SITUATIONS, and that is the whole reason this half exists. The rows come from
 * `myCart` and the money from `coursesCheckoutPreview`, and either can arrive or fail without the
 * other. Folding them into one flag would blank rows that are already true the moment pricing
 * failed - which is the state the reference cart handles and the design draws.
 *
 * NOTHING HERE COMPUTES A TOTAL. Every figure is formatted from what the preview returned; the
 * saving is the server's subtraction, not this file's.
 *
 * REMOVAL IS NOT HERE EITHER. Each line owns its own, because the mutation is keyed by course and
 * one hook per course cannot be called from a loop.
 */
export const CartPage = () => {
    const t = useTranslations("cart")
    const locale = useLocale()
    const router = useRouter()
    const { mutate } = useSWRConfig()
    const [hasClearFailed, setHasClearFailed] = useState(false)

    /*
     * A SIGNED-OUT READER HAS NO EMPTY BASKET, THEY HAVE NO BASKET. The cart query is
     * viewer-scoped, so with no token its key is null and it never fires - leaving no data and no
     * error, which an unguarded read turns into "your basket is empty". The real page said exactly
     * that to somebody nobody had asked to sign in.
     */
    const token = useSessionToken()
    const isSignedOut = token === undefined
    const cart = useQueryMyCartSwr()
    const courseIds = useMemo(
        () => (cart.data ?? []).map((row) => row.courseId),
        [cart.data],
    )
    const preview = useQueryCoursesCheckoutPreviewSwr(courseIds)
    const clearing = useMutateClearCartSwr()
    const checkout = useMutateCoursesCheckoutSwr()

    const money = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    })

    /*
     * THE PRICE JOINS THE ROW BY COURSE, not by position. The preview drops courses the viewer has
     * since bought, so the two lists can differ in length - and a positional join would then print
     * one course's price beside another course's name.
     */
    const pricedBy = new Map((preview.data?.lines ?? []).map((line) => [line.courseId, line]))

    const lines: ReadonlyArray<CartLineData> = (cart.data ?? []).map((row) => {
        const priced = pricedBy.get(row.courseId)
        return {
            courseId: row.courseId,
            title: row.course.title,
            cover: row.course.coverImageUrl ?? null,
            price: priced === undefined ? undefined : money.format(priced.chargedVnd),
            // The struck price is omitted rather than repeated when nothing was taken off: a rule
            // through a number that is still true is a rule saying nothing.
            originalPrice:
                priced === undefined || priced.listVnd <= priced.chargedVnd
                    ? undefined
                    : money.format(priced.listVnd),
            discountLabel:
                priced === undefined || priced.discountPercent <= 0
                    ? undefined
                    : t("discount", { percent: priced.discountPercent }),
            removeLabel: t("remove"),
        }
    })

    const instalment = preview.data?.installmentOptions?.[0]

    const state: CartPageState =
        isSignedOut
            ? "failed"
            : cart.isLoading
                ? "pending"
                : cart.error !== undefined
                    ? "failed"
                    : lines.length === 0 ? "empty" : "ready"

    return (
        <CartPageBase
            state={state}
            props={{
                labels: {
                    navHome: t("navHome"),
                    navCart: t("navCart"),
                    title: t("title"),
                    summary: {
                        subtotal: t("subtotal"),
                        savings: t("savings"),
                        surcharge: t("installmentFee"),
                        total: t("total"),
                        unavailable: t("unavailable"),
                    },
                    installmentHint: t("installmentHint", {
                        amount: money.format(instalment?.monthlyAmountVnd ?? 0),
                    }),
                    checkout: t("checkout", { count: lines.length }),
                    clearAll: hasClearFailed ? t("clearFailed") : t("clearAll"),
                    confirmClearAll: t("confirmClearAll"),
                    emptyMessage: t("emptyMessage"),
                    failedMessage: isSignedOut ? t("signedOutMessage") : t("failedMessage"),
                    failedAction: isSignedOut ? t("signedOutAction") : t("failedAction"),
                    emptyAction: t("emptyAction"),
                },
                lines,
                subtotal:
                    preview.data === null || preview.data === undefined
                        ? undefined
                        : money.format(preview.data.totalListVnd),
                savings:
                    preview.data === null || preview.data === undefined || preview.data.savingsVnd <= 0
                        ? undefined
                        : `-${money.format(preview.data.savingsVnd)}`,
                total:
                    preview.data === null || preview.data === undefined
                        ? undefined
                        : money.format(preview.data.totalChargedVnd),
                // The rows can be real while the money is not. The summary says so on its own.
                hasPricingFailed: preview.error !== undefined,
            }}
            on={{
                /*
                 * THE PRESS GOES STRAIGHT TO THE PROVIDER, and the approved overlay is NOT mounted
                 * between them. That overlay names the gateways as a line of prose rather than
                 * offering them as a choice, so putting it here would add a step that appears to
                 * ask a question it cannot take an answer to. PayOS is the default until the
                 * picker exists - a domestic gateway, and the one the instalment path will need.
                 */
                checkout: () => {
                    if (lines.length === 0) return
                    const here = window.location.href
                    void checkout
                        .trigger({ courseIds, paymentType: "payos", returnUrl: here, cancelUrl: here })
                        .then((result) => {
                            const url = result?.data?.coursesCheckout?.data?.checkoutUrl
                            // Nothing is celebrated here. The order is pending until the provider's
                            // webhook confirms it, so the only honest next step is the provider.
                            if (typeof url === "string" && url !== "") window.location.assign(url)
                        })
                },
                clearAll: () => {
                    setHasClearFailed(false)
                    void clearing.trigger().then((result) => {
                        if (result?.data?.clearCart?.success !== true) {
                            // Reported, not swallowed. A basket that stayed full after "clear all"
                            // with no word said reads as a control that does nothing.
                            setHasClearFailed(true)
                            return
                        }
                        void mutate(
                            (key) => Array.isArray(key) && key[0] === QUERY_MY_CART_SWR_KEY[0],
                        )
                    })
                },
                goHome: () => router.push("/dashboard"),
                // The notice's action means two things by state, so the handler does too: from an
                // empty basket it leaves for the catalogue, from a refused read it asks again.
                browse: () => {
                    if (isSignedOut) { router.push("/authentication"); return }
                    if (state === "failed") { void cart.mutate(); return }
                    router.push("/courses")
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "commerce" } as const
