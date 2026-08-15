import { Badge } from "@/components/leaves/Badge"
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
 * Native details/summary owns keyboard and expanded-state semantics. The rows intentionally have
 * no nested card, border or radius: they are supporting facts inside the rail's sole SurfaceCard.
 */
export const PricingPhaseDisclosure = (input: PricingPhaseDisclosureProps) => (
    <details className="group" open={input.props.isOpen}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-2 text-sm font-medium marker:content-none">
            <span>{input.props.label}</span>
            <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">⌄</span>
        </summary>
        <ul className="divide-y divide-separator">
            {input.props.phases.map((phase) => (
                <li key={phase.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    {phase.isActive === true
                        ? <Badge props={{ content: phase.name, tone: "accent" }} />
                        : <span className="font-medium">{phase.name}</span>}
                    <span className="text-muted">{phase.value}</span>
                </li>
            ))}
        </ul>
    </details>
)

/** Source-level tier marker. */
export const meta = { shape: "leaf", world: "pure" } as const
