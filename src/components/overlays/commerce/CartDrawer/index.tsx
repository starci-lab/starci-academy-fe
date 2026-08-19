"use client"

import { useMemo } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useQueryCoursesCheckoutPreviewSwr, useQueryMyCartSwr } from "@/hooks"
import { useSessionToken } from "@/hooks/auth/useSessionToken"
import { CartDrawerBase, type CartDrawerState } from "./component"
import { type CartLineData } from "@/components/blocks/commerce/CartLine/component"

/**
 * The cart drawer, resolved for the asking viewer.
 *
 * IT SHARES THE PAGE'S CACHE RATHER THAN ITS OWN. Both surfaces read `myCart` and the checkout
 * preview under the same keys, so removing a line in the drawer and then opening `/cart` shows one
 * basket rather than two answers - and the second surface costs no extra request.
 *
 * IT DOES NOT OWN WHETHER IT IS OPEN. Whatever mounts it holds that, because the control that opens
 * it lives in the navigation and the drawer has to outlive the route under it.
 */

/** What the shell hands the drawer. */
export type CartDrawerProps = {
    /** Whether the panel is showing. */
    readonly isOpen: boolean
    /** Called on every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
}

/**
 * Draw the basket over whatever page is open.
 *
 * @param input - {@link CartDrawerProps}
 */
export const CartDrawer = ({ isOpen, onDismiss }: CartDrawerProps) => {
    const t = useTranslations("cart")
    const locale = useLocale()
    const router = useRouter()

    /*
     * A SIGNED-OUT READER HAS NO EMPTY BASKET, THEY HAVE NO BASKET. The cart query is
     * viewer-scoped, so with no token its key is null and it never fires - leaving no data and no
     * error, which an unguarded read turns into "your basket is empty". The real page said exactly
     * that to somebody nobody had asked to sign in.
     */
    const token = useSessionToken()
    const isSignedOut = token === undefined
    const cart = useQueryMyCartSwr()
    const courseIds = useMemo(() => (cart.data ?? []).map((row) => row.courseId), [cart.data])
    const preview = useQueryCoursesCheckoutPreviewSwr(courseIds)

    const money = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    })

    const pricedBy = new Map((preview.data?.lines ?? []).map((line) => [line.courseId, line]))
    const lines: ReadonlyArray<CartLineData> = (cart.data ?? []).map((row) => {
        const priced = pricedBy.get(row.courseId)
        return {
            courseId: row.courseId,
            title: row.course.title,
            cover: row.course.coverImageUrl ?? null,
            price: priced === undefined ? undefined : money.format(priced.chargedVnd),
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

    const state: CartDrawerState =
        isSignedOut
            ? "failed"
            : cart.isLoading
                ? "pending"
                : cart.error !== undefined
                    ? "failed"
                    : lines.length === 0 ? "empty" : "ready"

    return (
        <CartDrawerBase
            state={state}
            props={{
                labels: {
                    title: t("drawerTitle", { count: lines.length }),
                    summary: {
                        subtotal: t("subtotal"),
                        savings: t("savings"),
                        surcharge: t("installmentFee"),
                        total: t("total"),
                        unavailable: t("unavailable"),
                    },
                    checkout: t("checkoutShort"),
                    viewFullCart: t("viewFullCart"),
                    emptyMessage: t("emptyMessage"),
                    failedMessage: isSignedOut ? t("signedOutMessage") : t("failedMessage"),
                    failedAction: isSignedOut ? t("signedOutAction") : t("failedAction"),
                    emptyAction: t("emptyAction"),
                },
                isOpen,
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
                hasPricingFailed: preview.error !== undefined,
            }}
            on={{
                dismiss: onDismiss,
                // BOTH WAYS OUT CLOSE THE PANEL FIRST. A drawer left open over the page it just
                // navigated to is a backdrop the reader has to dismiss before they can read what
                // they asked for.
                checkout: () => {
                    onDismiss()
                    router.push("/cart")
                },
                viewFullCart: () => {
                    onDismiss()
                    router.push("/cart")
                },
                browse: () => {
                    if (isSignedOut) { router.push("/authentication"); return }
                    if (state === "failed") { void cart.mutate(); return }
                    onDismiss()
                    router.push("/courses")
                },
            }}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "commerce" } as const
