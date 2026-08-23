import { Tree } from "@/components/branches/Tree"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
    type CompositeProps,
} from "@/components/contracts/props"

/** One stable supporting statement rendered as a member of a dot list. */
export type SupportingDotListEntry = {
    readonly id: string
    readonly content: string
}

/** Supporting statements owned by one same-tone dot-list composition. */
export type SupportingDotListData = {
    readonly entries: ReadonlyArray<SupportingDotListEntry>
}

/** Props for {@link SupportingDotList}. */
export type SupportingDotListProps = CompositeProps<SupportingDotListData>

/** Draw non-interactive supporting statements with same-tone dot markers. */
export const SupportingDotList = ({ props, isLoading = false }: SupportingDotListProps) => (
    <Tree
        contract="supporting-dot-list"
        render={defineContractComponent("supporting-dot-list", {
            entry: props.entries.map((entry) => defineContractComponent("supporting-dot-list-entry", {
                marker: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: "•", size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
                label: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                    <Text props={{ content: entry.content, size: "sm", tone: "muted" }} isLoading={isLoading} />
                )),
            })),
        })}
    />
)

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
