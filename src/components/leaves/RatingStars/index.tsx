"use client"

import ReactStars from "react-rating-stars-component"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/** The fixed rating scale used by course reviews. */
const SCORE_SCALE = 5

/** Outline used by the package for an unfilled position. */
const EMPTY_STAR = <Icon props={{ name: "ratingStarEmpty", role: "leading" }} />

/** Solid mark used by the package for a filled position. */
const FILLED_STAR = <Icon props={{ name: "ratingStarFilled", role: "leading" }} />

/**
 * The package accepts a dedicated half icon rather than clipping a supplied full icon. Keep the
 * clipping here so the visual still comes from the same Heroicons star in all three states.
 */
const HALF_STAR = (
    <span aria-hidden="true" className="relative block size-5">
        <span className="absolute inset-0">
            <Icon props={{ name: "ratingStarEmpty", role: "leading" }} />
        </span>
        <span className="absolute inset-y-0 left-0 block w-1/2 overflow-hidden">
            <span className="block size-5 max-w-none">
                <Icon props={{ name: "ratingStarFilled", role: "leading" }} />
            </span>
        </span>
    </span>
)

/** What one read-only star run draws. */
export type RatingStarsData = {
    /** Accessible description, already localized by the caller. */
    readonly label: string
    /** Score on the five-star scale; half values are preserved. */
    readonly value: number
}

/** Props for the read-only rating leaf. */
export type RatingStarsProps = LeafProps<RatingStarsData>

/**
 * LEAF - `RatingStars`: a compact, read-only five-star rating.
 *
 * The third-party package remains behind this leaf so blocks never depend on its untyped API.
 * `var(--warning)` gives the active stars the product's theme-aware yellow in light and dark mode;
 * inactive stars use the separator token instead of a second hard-coded colour.
 */
export const RatingStars = ({ props, isLoading = false }: RatingStarsProps) => {
    if (isLoading) {
        return (
            <span
                aria-hidden="true"
                className="h-5 w-24 animate-pulse rounded-full bg-default"
                data-component="RatingStars"
                data-tier="leaf"
            />
        )
    }

    return (
        <span
            aria-label={props.label}
            data-component="RatingStars"
            data-rating={props.value}
            data-tier="leaf"
            role="img"
        >
            <ReactStars
                a11y
                activeColor="var(--warning)"
                classNames="leading-none"
                color="var(--separator)"
                count={SCORE_SCALE}
                edit={false}
                emptyIcon={EMPTY_STAR}
                filledIcon={FILLED_STAR}
                halfIcon={HALF_STAR}
                isHalf
                size={20}
                value={props.value}
            />
        </span>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
