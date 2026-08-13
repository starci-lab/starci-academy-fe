"use client"

import { useLocale, useTranslations } from "next-intl"
import {
    _CoursePriceDetail,
    type CoursePriceDetailState,
    type CoursePriceLine,
} from "@/components/blocks/courses/CoursePriceDetail/component"
import { defineContractProjection } from "@/components/contracts/props"
import { useQueryCoursePricePreviewSwr } from "@/hooks"
import { isPersonalPrice } from "@/modules/utils/course-price"
import { _CoursePriceOverlay } from "./component"

/**
 * OVERLAY - `CoursePriceOverlay`, connected half.
 *
 * IT ASKS FOR THE PRICE ITSELF rather than receiving it. The card that opens it already asked, and
 * SWR answers the second caller from the same entry under the same viewer-scoped key, so this costs
 * no extra request. What it buys is that the whole price story - the reckoning, the reason and the
 * scarcity line - is resolved in ONE place; the card is left owning only the number on its face.
 *
 * IT RESOLVES THE COPY, and the block draws it. The reason the server gives is an enum, and which
 * sentence an enum earns is a decision about wording, not about layout, so it is settled here where
 * the translator lives.
 *
 * A REASON WITHOUT A REDUCTION IS NOT SHOWN. The server answers every signed-in viewer, including
 * one whose tier takes nothing off; printing "you get a further discount" beside a price identical
 * to everyone else's is a sentence the reader can check and find false.
 */

/** Props for {@link CoursePriceOverlay}. */
export type CoursePriceOverlayConnectedProps = {
    /** The course being priced. Absent while nothing is explaining itself. */
    readonly courseId?: string
    /** Its already-resolved title, so the surface names what it is pricing. */
    readonly title?: string
    /** Whether the surface is on screen. Owned by the card that opens it. */
    readonly isOpen: boolean
    /** Every way out. */
    readonly onDismiss: () => void
}

/** Which sentence each server reason earns. `none` earns none, which is why it is absent here. */
const REASON_KEYS: Readonly<Record<string, "reasonEnrolled" | "reasonDiligent" | "reasonBoth">> = {
    enrolledCount: "reasonEnrolled",
    diligent: "reasonDiligent",
    both: "reasonBoth",
}

/**
 * Resolve the price story and mount it inside the covering surface.
 *
 * @param input - {@link CoursePriceOverlayConnectedProps}
 */
export const CoursePriceOverlay = ({ courseId, title, isOpen, onDismiss }: CoursePriceOverlayConnectedProps) => {
    const t = useTranslations("courses.catalog")
    const locale = useLocale()
    // Asked only while the surface is open. Where a card opened it, the card already asked and SWR
    // answers from that entry under the same viewer-scoped key, so opening costs nothing; where
    // nothing asked first, an unopened surface stays idle instead of pre-fetching a reckoning.
    const preview = useQueryCoursePricePreviewSwr(isOpen ? courseId : undefined)

    const money = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
    })

    const data = preview.data ?? undefined
    const isPersonal = isPersonalPrice(data)

    const state: CoursePriceDetailState = preview.isLoading
        ? "pending"
        : data === undefined ? "unavailable" : "ready"

    const lines: ReadonlyArray<CoursePriceLine> = data === undefined
        ? []
        : [
            { id: "list", label: t("lineList"), value: money.format(data.originalPriceVnd) },
            { id: "phase", label: t("linePhase"), value: money.format(data.phasePriceVnd) },
            ...(isPersonal
                ? [{
                    id: "loyalty",
                    label: t("lineLoyalty"),
                    value: money.format(data.phasePriceVnd - data.discountedPriceVnd),
                }]
                : []),
            { id: "payable", label: t("linePayable"), value: money.format(data.discountedPriceVnd) },
        ]

    const reasonKey = data === undefined ? undefined : REASON_KEYS[data.discountReason]
    const reason = !isPersonal || reasonKey === undefined
        ? undefined
        : t(reasonKey, { count: data?.enrolledCount ?? 0 })

    // Scarcity is only true when there IS a next phase to rise to. Seats without a next price would
    // say "hurry" without saying towards what, so both halves come from the same answer or neither.
    const forwardLook = data?.nextPhasePriceVnd == null
        ? undefined
        : data.seatsRemainingInCurrentPhase == null
            ? t("nextPhase", { price: money.format(data.nextPhasePriceVnd) })
            : t("seatsThenPrice", {
                seats: data.seatsRemainingInCurrentPhase,
                price: money.format(data.nextPhasePriceVnd),
            })

    return (
        <_CoursePriceOverlay
            isOpen={isOpen}
            onDismiss={onDismiss}
            render={defineContractProjection("course-price-detail-stack", () => (
                <_CoursePriceDetail
                    state={state}
                    props={{
                        title,
                        unavailableMessage: t("priceDetailGuest"),
                        lines,
                        ...(reason === undefined ? {} : { reason }),
                        ...(forwardLook === undefined ? {} : { forwardLook }),
                    }}
                />
            ))}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "connected", domain: "courses" } as const
