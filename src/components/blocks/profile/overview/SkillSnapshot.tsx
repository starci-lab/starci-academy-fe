import { SurfaceCard } from "@/components/branches/SurfaceCard"
import {
    LabelledProgressRow,
    type LabelledProgressRowData,
} from "@/components/composites/LabelledProgressRow"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"

/** Settled facts for one challenge/practice skill snapshot. */
export type SkillSnapshotProps = {
  readonly label: string;
  readonly totalLabel: string;
  readonly totalValue?: string;
  readonly rows: ReadonlyArray<LabelledProgressRowData>;
  readonly stateMessage?: string;
  readonly isLoading?: boolean;
};

/** Shared anatomy only: one headline fact followed by difficulty/language progress peers. */
export const SkillSnapshot = (props: SkillSnapshotProps) => (
    <SurfaceCard props={{ label: props.label }}>
        {props.stateMessage && !props.isLoading ? (
            <IconLabelFactRow
                props={{
                    icon: "practice",
                    label: props.stateMessage,
                    recipe: "label-led",
                }}
            />
        ) : (
            <>
                <IconLabelFactRow
                    isLoading={props.isLoading}
                    props={{
                        icon: "practice",
                        label: props.totalLabel,
                        endText: props.totalValue,
                        recipe: "label-led",
                    }}
                />
                {props.rows.map((row) => (
                    <LabelledProgressRow
                        key={row.id}
                        isLoading={props.isLoading}
                        props={row}
                    />
                ))}
            </>
        )}
    </SurfaceCard>
)
