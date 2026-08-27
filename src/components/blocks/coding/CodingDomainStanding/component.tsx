import { Progress } from "@/components/leaves/Progress"
import { Text } from "@/components/leaves/Text"

/** Pure topic standing input; the connected block resolves its two source queries. */
export type CodingDomainStandingProps = { readonly standingLabel: string; readonly standingFact: string; readonly meterLabel: string; readonly percent: number }

/** Draw one topic's solved count and progress meter. */
export const CodingDomainStandingBase = (props: CodingDomainStandingProps) => <div><div><Text props={{ content: props.standingLabel, size: "sm", weight: "semibold" }} /><Text props={{ content: props.standingFact, size: "xs", tone: "muted" }} /></div><Progress props={{ label: props.meterLabel, value: props.percent }} /></div>
