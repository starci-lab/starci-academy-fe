import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { Button } from "@starci/grammar/common"
import { Select } from "@/components/leaves/Select"
import { Text } from "@starci/grammar/common"

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
            <Text size={"sm"} tone={"muted"}>{props.labels.description}</Text>
            <Text size={"xs"} tone={"muted"}>{props.quotaLabel ?? props.labels.quotaUnavailable}</Text>
            <div>
                {props.models.map((model) => (
                    <div key={model.id}>
                        <Button variant={model.id === props.selectedDefaultModelId ? "primary" : "outline"} isDisabled={model.disabled} onPress={() => props.onSelectDefault?.(model.id)}>{model.id === props.selectedDefaultModelId
                            ? `${model.label} · ${props.labels.selected}`
                            : model.label}</Button>
                        <Text size={"xs"} tone={"muted"}>{model.detail}</Text>
                    </div>
                ))}
            </div>
            <Button variant="secondary" onPress={props.onApplyAll}>{props.labels.applyAll}</Button>
            {props.deliverables.map((deliverable) => (
                <div key={deliverable.id}>
                    <Text size={"sm"} weight={"semibold"}>{props.labels.override(deliverable.title)}</Text>
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
