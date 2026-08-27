import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
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
export type ChallengeGradingModelDrawerBaseProps = {
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
export const ChallengeGradingModelDrawerBase = (input: ChallengeGradingModelDrawerBaseProps) => {
    const options = input.models.filter((model) => model.disabled !== true)
    const render = defineContractComponent("challenge-model-drawer", {
        description: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
            <Text props={{ content: input.labels.description, size: "sm", tone: "muted" }} />
        )),
        quota: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: input.quotaLabel ?? input.labels.quotaUnavailable, size: "xs", tone: "muted" }} />
        )),
        model: input.models.map((model) => defineContractComponent("challenge-model-option", {
            action: defineLeafComponent("button", {}, () => (
                <Button
                    props={{
                        label: model.id === input.selectedDefaultModelId
                            ? `${model.label} · ${input.labels.selected}`
                            : model.label,
                        variant: model.id === input.selectedDefaultModelId ? "primary" : "outline",
                        disabled: model.disabled,
                    }}
                    on={{ press: () => input.onSelectDefault?.(model.id) }}
                />
            )),
            detail: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: model.detail, size: "xs", tone: "muted" }} />
            )),
        })),
        apply: defineLeafComponent("button", {}, () => (
            <Button props={{ label: input.labels.applyAll, variant: "secondary" }} on={{ press: input.onApplyAll }} />
        )),
        override: input.deliverables.map((deliverable) => defineContractComponent("challenge-model-override", {
            label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                <Text props={{ content: input.labels.override(deliverable.title), size: "sm", weight: "semibold" }} />
            )),
            model: defineLeafComponent("select", {}, () => (
                <Select
                    props={{
                        id: `challenge-model-${deliverable.id}`,
                        name: `challenge-model-${deliverable.id}`,
                        label: input.labels.override(deliverable.title),
                        options,
                        selectedKey: deliverable.selectedModelId,
                    }}
                    on={{ select: (modelId) => input.onOverride?.(deliverable.id, modelId) }}
                />
            )),
        })),
    })

    return (
        <DrawerBranch
            isOpen={input.isOpen}
            placement="right"
            title={input.labels.title}
            onDismiss={input.onDismiss}
            contract="challenge-model-drawer"
            render={defineContractProjection("challenge-model-drawer", () => (
                <Tree contract="challenge-model-drawer" render={render} />
            ))}
        />
    )
}

/** Pure ownership marker for Challenge model-selection mechanics. */
export const meta = { shape: "overlay", world: "pure", domain: "learn" } as const
