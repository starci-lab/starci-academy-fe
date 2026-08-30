import { cn } from "@heroui/react"
import type { ReactNode } from "react"

export type MediaFrameProps = {
    readonly children: ReactNode
    readonly caption?: ReactNode
    readonly aspect?: "landscape" | "portrait" | "square" | "auto"
    readonly fit?: "cover" | "contain"
    readonly className?: string
}

/**
 * Product-family frame for an approved illustration, photograph or generated bitmap.
 * Asset purpose and generation authority stay with the consuming product workflow.
 */
export const MediaFrame = ({
    children,
    caption,
    aspect = "landscape",
    fit = "cover",
    className,
}: MediaFrameProps) => (
    <figure
        className={cn("starci-core-media-frame", className)}
        data-grammar-media-aspect={aspect}
        data-grammar-media-fit={fit}
    >
        <div className="starci-core-media-viewport" data-grammar-media="true">{children}</div>
        {caption === undefined ? null : <figcaption className="starci-core-media-caption">{caption}</figcaption>}
    </figure>
)
