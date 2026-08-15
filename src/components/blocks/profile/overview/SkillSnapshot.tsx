import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { LabelledProgressRow, type LabelledProgressRowData } from "@/components/composites/LabelledProgressRow"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import { defineCompositeComponent, defineContractComponent } from "@/components/contracts/props"

/** Settled facts for one challenge/practice skill snapshot. */
export type SkillSnapshotProps = { readonly label: string, readonly totalLabel: string, readonly totalValue?: string, readonly rows: ReadonlyArray<LabelledProgressRowData>, readonly stateMessage?: string, readonly isLoading?: boolean }

/** Shared anatomy only: one headline fact followed by difficulty/language progress peers. */
export const SkillSnapshot = ({ label, totalLabel, totalValue, rows, stateMessage, isLoading = false }: SkillSnapshotProps) => (
    <SurfaceCard props={{ label }} contract="stacked-peer-controls" render={defineContractComponent("stacked-peer-controls", {
        control: stateMessage && !isLoading
            ? [defineCompositeComponent("icon-label-fact-row", {}, () => <IconLabelFactRow props={{ icon: "practice", label: stateMessage, recipe: "label-led" }} />)]
            : [
                defineCompositeComponent("icon-label-fact-row", {}, () => <IconLabelFactRow isLoading={isLoading} props={{ icon: "practice", label: totalLabel, endText: totalValue, recipe: "label-led" }} />),
                ...rows.map((row) => defineCompositeComponent("labelled-progress-row", {}, () => <LabelledProgressRow isLoading={isLoading} props={row} />)),
            ],
    })} />
)
