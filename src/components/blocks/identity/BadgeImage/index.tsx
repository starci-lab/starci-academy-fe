"use client"

import { useEffect, useState } from "react"
import type { ContractSlot } from "@/components/contracts"

/**
 * BLOCK - `BadgeImage`: award artwork that may not have been drawn yet.
 *
 * PORTED FROM THE LIVE PRODUCT, where the point was never the picture but the ABSENCE of one:
 * badge art is uploaded piece by piece as a designer finishes it, so for months the honest
 * answer for most badges is "there is no image". The original built the URL itself from a
 * storage bucket read out of the environment, which meant the component could not be rendered
 * anywhere the bucket was not configured - a test, a story, a second product. The address
 * arrives resolved instead; building it is the data layer's job.
 *
 * THE FALLBACK IS A SLOT, NOT A PICTURE. It is passed UNCALLED like every other slot in this
 * tree, so whoever owns the surface decides what stands in for missing art - a tile, a letter,
 * a rank. A component that chose for them would be choosing for every badge at once.
 *
 * WHY THE FAILURE IS WATCHED RATHER THAN GUESSED. A missing object answers with an error on
 * LOAD, not with an empty URL, so there is nothing to check before rendering: the only way to
 * know is to try. That is why the flag lives in state, and why it is reset when the address
 * changes - a badge that failed once must not stay failed for the next badge in the list.
 */

/** The two sizes a badge is drawn at: beside a name, or as the subject of its own tile. */
export type BadgeImageSize = "sm" | "md"

/** Size to the square the picture is drawn in. A leaf's own footprint, not a shape. */
const SIZE_CLASSES: Record<BadgeImageSize, string> = {
    sm: "size-8 rounded-lg object-cover",
    md: "size-12 rounded-xl object-cover",
}

/** Props for {@link BadgeImage}. */
export interface BadgeImageProps {
    /** The already-built address of the artwork. */
    src: string
    /** What the badge IS, in words - the alternative text, and the only identity it has. */
    alt: string
    /** How big the square is. Defaults to the size a badge takes beside a name. */
    size?: BadgeImageSize
    /**
     * What stands in when there is no artwork yet - passed UNCALLED, so it can rest with the
     * rest of the region rather than being built before anything is known.
     */
    fallback: ContractSlot
    /** Nothing to show yet - the fallback rests in place of the picture. */
    isLoading?: boolean
}

/**
 * Draw a badge's artwork, or what stands in for it.
 *
 * @param props - {@link BadgeImageProps}
 */
export const BadgeImage = ({ src, alt, size = "sm", fallback: Fallback, isLoading = false }: BadgeImageProps) => {
    // Set once the object answers with an error, which is the ONLY moment a missing upload
    // becomes knowable. Reset on a new address so one badge's absence is not inherited by the
    // next one rendered through the same element.
    const [hasFailed, setHasFailed] = useState(false)
    useEffect(() => setHasFailed(false), [src])

    if (isLoading || hasFailed) {
        return <Fallback isLoading={isLoading} />
    }

    return (
        <img
            data-tier="block"
            data-component="BadgeImage"
            src={src}
            alt={alt}
            loading="lazy"
            className={SIZE_CLASSES[size]}
            onError={() => setHasFailed(true)}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { tier: "block", name: "BadgeImage" } as const
