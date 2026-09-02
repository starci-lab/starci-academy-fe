"use client"

import ReactStars from "react-rating-stars-component"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { ratingHalfClipClassName, ratingHalfEmptyClassName, ratingHalfFilledClassName, ratingHalfRootClassName, ratingLoadingClassName, ratingStarsClassName } from "./classNames"

/** The fixed rating scale used by course reviews. */
const SCORE_SCALE = 5

/** Outline used by the package for an unfilled position. */
const EMPTY_STAR = <Icon source={iconSourceFor("ratingStarEmpty", "leading")} role={"leading"} />

/** Solid mark used by the package for a filled position. */
const FILLED_STAR = <Icon source={iconSourceFor("ratingStarFilled", "leading")} role={"leading"} />

/**
 * The package accepts a dedicated half icon rather than clipping a supplied full icon. Keep the
 * clipping here so the visual still comes from the same Heroicons star in all three states.
 */
const HALF_STAR = (
    <span aria-hidden="true" className={ratingHalfRootClassName}>
        <span className={ratingHalfEmptyClassName}>
            <Icon source={iconSourceFor("ratingStarEmpty", "leading")} role={"leading"} />
        </span>
        <span className={ratingHalfClipClassName}>
            <span className={ratingHalfFilledClassName}>
                <Icon source={iconSourceFor("ratingStarFilled", "leading")} role={"leading"} />
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
export type RatingStarsProps = { readonly props: RatingStarsData; readonly isLoading?: boolean }

/**
 * LEAF - `RatingStars`: a compact, read-only five-star rating.
 *
 * The third-party package remains behind this leaf so blocks never depend on its untyped API.
 * `var(--warning)` gives the active stars the product's theme-aware yellow in light and dark mode;
 * inactive stars use the separator token instead of a second hard-coded colour.
 */
export const RatingStars = (props: RatingStarsProps) => {
    const isLoading = props.isLoading === true
    if (isLoading) {
        return (
            <span
                aria-hidden="true"
                className={ratingLoadingClassName}
            />
        )
    }

    return (
        <span
            aria-label={props.props.label}
            data-rating={props.props.value}
            role="img"
        >
            <ReactStars
                a11y
                activeColor="var(--warning)"
                classNames={ratingStarsClassName}
                color="var(--separator)"
                count={SCORE_SCALE}
                edit={false}
                emptyIcon={EMPTY_STAR}
                filledIcon={FILLED_STAR}
                halfIcon={HALF_STAR}
                isHalf
                size={20}
                value={props.props.value}
            />
        </span>
    )
}
