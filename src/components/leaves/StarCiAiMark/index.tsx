import Image from "next/image"
import { starCiAiMarkClassName, starCiAiMarkImageClassName } from "./classNames"

/** Closed data for the product-owned StarCi AI mark. */
export type StarCiAiMarkData = {
    /** Accessible fallback when the mark is used without adjacent product copy. */
    readonly alt?: string
}

/** Props for the fixed StarCi AI brand asset. */
export type StarCiAiMarkProps = { readonly props: StarCiAiMarkData; readonly isLoading?: boolean }

/** Draw the dedicated conversational-learning mark instead of a generic AI glyph. */
export const StarCiAiMark = (props: StarCiAiMarkProps) => (
    <span
        data-loading={props.isLoading ? "true" : "false"}
        className={starCiAiMarkClassName}
    >
        {props.isLoading ? null : (
            <Image
                src="/brand/starci-ai-mark-v1.png"
                alt={props.props.alt ?? ""}
                width={28}
                height={28}
                className={starCiAiMarkImageClassName}
            />
        )}
    </span>
)
