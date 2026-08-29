import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EvidenceRow } from "@/components/composites/EvidenceRow"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import { Text } from "@/components/leaves/Text"
import { profileSkillListClassName, skillSnapshotClassName } from "./classNames"

/** One settled count in a skill-evidence breakdown. */
export type SkillSnapshotRow = {
    readonly id: string
    readonly title: string
    readonly value?: string
}

/** Settled facts for one challenge/practice skill snapshot. */
export type SkillSnapshotProps = {
  readonly label: string;
  readonly totalLabel: string;
  readonly totalValue?: string;
  readonly rows: ReadonlyArray<SkillSnapshotRow>;
  readonly stateMessage?: string;
  readonly supportingMessage?: string;
  readonly isLoading?: boolean;
};

/** Shared anatomy only: one headline fact followed by difficulty/language progress peers. */
export const SkillSnapshot = (props: SkillSnapshotProps) => {
    const settledStateMessage = props.isLoading ? undefined : props.stateMessage

    return (
        <SurfaceCard props={{ label: props.label, inset: "compact" }}>
            <div className={skillSnapshotClassName}>
                {settledStateMessage ? (
                    <IconLabelFactRow
                        props={{
                            icon: "practice",
                            label: settledStateMessage,
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
                        <SurfaceListCard
                            props={{ label: props.label, isLabelHidden: true, isNested: true }}
                            isLoading={props.isLoading}
                        >
                            <div className={profileSkillListClassName}>
                                {props.rows.map((row) => <EvidenceRow
                                    key={row.id}
                                    isLoading={props.isLoading}
                                    props={{ title: row.title, fact: row.value }}
                                />)}
                            </div>
                        </SurfaceListCard>
                        {props.supportingMessage === undefined ? null : <Text
                            props={{ content: props.supportingMessage, size: "xs", tone: "muted" }}
                        />}
                    </>
                )}
            </div>
        </SurfaceCard>
    )
}
