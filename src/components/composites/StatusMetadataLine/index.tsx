import { Tree } from "@/components/branches/Tree"
import { Badge, type BadgeTone } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
import type { IconName } from "@/components/leaves/Icon"
import type { CompositeProps } from "@/components/contracts/props"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** The one semantic status a metadata sentence may promote into a chip. */
export type StatusMetadataLineStatus = {
    readonly content: string
    readonly tone: BadgeTone
    readonly icon?: IconName
}

/** One optional status followed by ordinary facts that remain one readable sentence. */
export type StatusMetadataLineData = {
    readonly status?: StatusMetadataLineStatus
    readonly facts: ReadonlyArray<string>
}

/** Props accepted by {@link StatusMetadataLine}. */
export type StatusMetadataLineProps = CompositeProps<StatusMetadataLineData>

/** Draw a metadata sentence with no path for a second status chip. */
export const StatusMetadataLine = ({ props, isLoading = false }: StatusMetadataLineProps) => {
    const status = props.status
    const facts = props.facts.filter((fact) => fact.trim() !== "").join(" · ")
    return (
        <Tree contract="status-metadata-line" render={defineContractComponent("status-metadata-line", {
            ...(status === undefined ? {} : {
                status: defineLeafComponent("badge", {}, () => (
                    <Badge props={status} isLoading={isLoading} />
                )),
            }),
            ...(facts === "" ? {} : {
                facts: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: facts, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            }),
        })} />
    )
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
