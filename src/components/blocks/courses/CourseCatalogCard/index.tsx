"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useMutateAddToCartSwr, useQueryCoursePricePreviewSwr } from "@/hooks"
import { isPersonalPrice } from "@/modules/utils/course-price"
import { CourseCatalogCardBase, type CourseCatalogCardData } from "./component"
export type { CourseCatalogCardData } from "./component"

/**
 * One catalog card, priced for the asking learner.
 *
 * WHY THE PRICE IS RESOLVED HERE AND NOT ON THE PAGE. The loyalty reduction is one request PER
 * COURSE behind a token, so a page that wanted it would have to fire a variable number of hooks -
 * which React does not allow - or fold a private answer into the shared list cache. The card is the
 * smallest thing that owns exactly one course, so it is the smallest thing that can ask.
 *
 * THE PHASE PRICE IS THE FLOOR, NOT A PLACEHOLDER. The page already resolved what the course costs
 * anybody; this only replaces it once a better, personal answer arrives. A guest never gets one and
 * never sees a gap, because there was never a hole to fill.
 *
 * IT DOES NOT FLASH. While the preview is in flight the card keeps showing the phase price rather
 * than a skeleton: the number on screen is true, it is simply not yet the cheapest true number, and
 * blanking a correct price to load a better one is how a grid of cards flickers on every render.
 *
 * IT REPORTS THE REQUEST FOR THE REASONING; IT DOES NOT ANSWER IT. A covering surface is not part
 * of a card's presentation, and a connected block renders its own twin and nothing else, so which
 * course is currently explaining itself is the page's state and the overlay is the page's mount.
 * Twenty cards holding twenty modals would also be twenty focus traps in one document.
 */

/** What the connected card needs from the page: everything except the price. */
export type CourseCatalogCardProps = {
    /** Whether this is a real course or one of the grid's resting shapes. */
    readonly state?: "pending" | "ready"
    /** The already-resolved card, priced from the phase. */
    readonly course: CourseCatalogCardData
    /** Called when the learner opens this course. */
    readonly onView?: () => void
    /** Called when the learner asks why this course costs what it costs. */
    readonly onOpenPriceDetail?: () => void
}

/**
 * Price the card for this viewer.
 *
 * @param input - {@link CourseCatalogCardProps}
 */
export const CourseCatalogCard = (props: CourseCatalogCardProps) => {
    const {
        state = "ready",
        course,
        onView,
        onOpenPriceDetail,
    } = props
    const t = useTranslations("courses.catalog")
    const locale = useLocale()
    const cart = useMutateAddToCartSwr(state === "pending" ? undefined : course.id)
    /*
     * THE CARD REMEMBERS THE ADD, because nothing else on this page does. There is no cart query
     * here to revalidate, so after a successful add the only record that this course is already in
     * the basket is the press that put it there - and a control that stays offering "add" after
     * succeeding invites a second press for a row that already exists.
     */
    const [isInCart, setIsInCart] = useState(false)
    // A RESTING CARD HAS NO COURSE TO PRICE. The grid rests three shapes while the first page is in
    // flight, and their ids are placeholders; asking the server what `resting-1` costs is a request
    // that can only fail.
    const preview = useQueryCoursePricePreviewSwr(state === "pending" ? undefined : course.id)

    const money = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    })

    const data = preview.data ?? undefined
    const priced: CourseCatalogCardData = isPersonalPrice(data)
        ? {
            ...course,
            price: money.format(data.discountedPriceVnd),
            originalPrice: money.format(data.originalPriceVnd),
            discountLabel: t("discount", { percent: data.discountPercent }),
            savingsLabel: t("savings", {
                amount: money.format(data.originalPriceVnd - data.discountedPriceVnd),
            }),
        }
        : course

    return (
        <CourseCatalogCardBase
            state={cart.isMutating ? "adding" : state}
            props={{
                ...priced,
                priceDetailLabel: t("priceDetail"),
                cartLabel: isInCart ? t("inCart") : t("addToCart"),
                isInCart,
            }}
            on={{
                view: onView,
                openPriceDetail: onOpenPriceDetail,
                addToCart: () => {
                    void cart.trigger({ courseId: course.id }).then((result) => {
                        // Reported, not assumed. The server answers an envelope rather than
                        // throwing on a refused add, so a failed add must leave the control
                        // offering the same thing it offered before the press.
                        if (result?.data?.addToCart?.success === true) setIsInCart(true)
                    })
                },
            }}
        />
    )
}
