import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"

/** Pure topic standing input; the connected block resolves its two source queries. */
export type CodingDomainStandingProps = { readonly standingLabel: string; readonly standingFact: string; readonly meterLabel: string; readonly percent: number }

/** Draw one topic's solved count and progress meter. */
export const CodingDomainStandingBase = (input: CodingDomainStandingProps) => <Tree contract="label-fact-over-progress" render={defineContractComponent("label-fact-over-progress", {
    line: defineContractComponent("label-with-muted-fact-row", {
        label: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: input.standingLabel, size: "sm", weight: "semibold" }} />),
        fact: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: input.standingFact, size: "xs", tone: "muted" }} />),
    }),
    progress: defineLeafComponent("progress", {}, () => <Progress props={{ label: input.meterLabel, value: input.percent }} />),
})} />

/** Source-level ownership marker for the pure standing renderer. */
export const meta = { world: "pure", domain: "coding" } as const
