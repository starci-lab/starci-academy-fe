import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { Button } from "@/components/leaves/Button"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"

/** One grading choice resolved from the public model catalogue. */
export type ChallengeGradingModelOption = {
    readonly id: string
    readonly label: string
    readonly detail: string
    readonly disabled?: boolean
}

/** One authored deliverable and the model that will be frozen into its attempt. */
export type ChallengeGradingModelDeliverable = {
    readonly id: string
    readonly title: string
    readonly selectedModelId: string
}

/** Localized copy for learner-owned Challenge grading settings. */
export type ChallengeGradingModelLabels = {
    readonly title: string
    readonly description: string
    readonly quotaUnavailable: string
    readonly applyAll: string
    readonly selected: string
    readonly override: (title: string) => string
}

/** Pure model-comparison drawer input. */
export type ChallengeGradingModelDrawerProps = {
    readonly isOpen: boolean
    readonly labels: ChallengeGradingModelLabels
    readonly quotaLabel?: string
    readonly models: ReadonlyArray<ChallengeGradingModelOption>
    readonly selectedDefaultModelId: string
    readonly deliverables: ReadonlyArray<ChallengeGradingModelDeliverable>
    readonly onDismiss: () => void
    readonly onSelectDefault?: (modelId: string) => void
    readonly onApplyAll?: () => void
    readonly onOverride?: (deliverableId: string, modelId: string) => void
}

/** Draw model comparison, quota evidence, apply-all and exact deliverable overrides. */
export const ChallengeGradingModelDrawerBase = (props: ChallengeGradingModelDrawerProps) => {
    const options = props.models.filter((model) => model.disabled !== true)
    return (
        <DrawerBranch
            isOpen={props.isOpen}
            placement="right"
            title={props.labels.title}
            onDismiss={props.onDismiss}
        >
            <Text props={{ content: props.labels.description, size: "sm", tone: "muted" }} />
            <Text props={{ content: props.quotaLabel ?? props.labels.quotaUnavailable, size: "xs", tone: "muted" }} />
            <div>
                {props.models.map((model) => (
                    <div key={model.id}>
                        <Button
                            props={{
                                label: model.id === props.selectedDefaultModelId
                                    ? `${model.label} · ${props.labels.selected}`
                                    : model.label,
                                variant: model.id === props.selectedDefaultModelId ? "primary" : "outline",
                                disabled: model.disabled,
                            }}
                            on={{ press: () => props.onSelectDefault?.(model.id) }}
                        />
                        <Text props={{ content: model.detail, size: "xs", tone: "muted" }} />
                    </div>
                ))}
            </div>
            <Button props={{ label: props.labels.applyAll, variant: "secondary" }} on={{ press: props.onApplyAll }} />
            {props.deliverables.map((deliverable) => (
                <div key={deliverable.id}>
                    <Text props={{ content: props.labels.override(deliverable.title), size: "sm", weight: "semibold" }} />
                    <Select
                        props={{
                            id: `challenge-model-${deliverable.id}`,
                            name: `challenge-model-${deliverable.id}`,
                            label: props.labels.override(deliverable.title),
                            options,
                            selectedKey: deliverable.selectedModelId,
                        }}
                        on={{ select: (modelId: string) => props.onOverride?.(deliverable.id, modelId) }}
                    />
                </div>
            ))}
        </DrawerBranch>
    )
}

/** Pure ownership marker for Challenge model-selection mechanics. */
