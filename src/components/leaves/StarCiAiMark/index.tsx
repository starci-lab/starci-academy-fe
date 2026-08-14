import type { LeafProps } from "@/components/contracts/props"
import Image from "next/image"

/** Closed data for the product-owned StarCi AI mark. */
export type StarCiAiMarkData = {
    /** Accessible fallback when the mark is used without adjacent product copy. */
    readonly alt?: string
}

/** Props for the fixed StarCi AI brand asset. */
export type StarCiAiMarkProps = LeafProps<StarCiAiMarkData>

/** Draw the dedicated conversational-learning mark instead of a generic AI glyph. */
export const StarCiAiMark = ({ props, isLoading = false }: StarCiAiMarkProps) => (
    <span
        data-tier="leaf"
        data-component="StarCiAiMark"
        data-loading={isLoading ? "true" : "false"}
        className="inline-flex size-7 shrink-0 items-center justify-center"
    >
        {isLoading ? null : (
            <Image
                src="/brand/starci-ai-mark-v1.png"
                alt={props.alt ?? ""}
                width={28}
                height={28}
                className="size-full object-contain"
            />
        )}
    </span>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure", domain: "ai" } as const
