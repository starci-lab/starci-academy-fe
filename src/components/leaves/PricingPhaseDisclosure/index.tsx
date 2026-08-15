"use client"

import { useState } from "react"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/** One already-resolved phase shown by the disclosure. */
export type PricingPhaseDisclosurePhase = {
    readonly id: string
    readonly name: string
    readonly value: string
    readonly isActive?: boolean
}

/** Data owned by the intrinsic phase disclosure. */
export type PricingPhaseDisclosureData = {
    readonly label: string
    readonly phases: ReadonlyArray<PricingPhaseDisclosurePhase>
    readonly isOpen?: boolean
}

/** Props for {@link PricingPhaseDisclosure}. */
export type PricingPhaseDisclosureProps = LeafProps<PricingPhaseDisclosureData>

/**
 * Reveal phase comparison only when requested.
 *
 * A native button owns keyboard and focus semantics while this leaf owns the bounded expanded
 * state. The rows intentionally have no nested card, border or radius: they are supporting facts
 * inside the rail's sole SurfaceCard.
 */
export const PricingPhaseDisclosure = (input: PricingPhaseDisclosureProps) => {
    const [isOpen, setIsOpen] = useState(input.props.isOpen === true)
    return (
        <details
            className="flex w-full flex-col gap-3"
            open={isOpen}
            onToggle={(event) => setIsOpen(event.currentTarget.open)}
        >
            <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-2 p-0 text-sm font-medium marker:content-none">
                <span>{input.props.label}</span>
                <span className={isOpen ? "rotate-90 text-foreground transition-transform" : "text-foreground transition-transform"}>
                    <Icon props={{ name: "disclosure", role: "chip" }} />
                </span>
            </summary>
            <div className="flex flex-col gap-2 px-4">
                {input.props.phases.map((phase) => (
                    <div key={phase.id} className="flex items-center justify-between gap-2">
                        <span
                            className={phase.isActive === true
                                ? "text-sm font-normal text-accent-soft-foreground"
                                : "text-sm font-normal text-foreground"}
                        >
                            {phase.name}
                        </span>
                        <span className="text-sm text-muted">{phase.value}</span>
                    </div>
                ))}
            </div>
        </details>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
