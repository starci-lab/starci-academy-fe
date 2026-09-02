import { Progress } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"

/** Pure topic standing input; the connected block resolves its two source queries. */
export type CodingDomainStandingProps = { readonly standingLabel: string; readonly standingFact: string; readonly meterLabel: string; readonly percent: number }

/** Draw one topic's solved count and progress meter. */
export const CodingDomainStandingBase = (props: CodingDomainStandingProps) => <div><div><Text size={"sm"} weight={"semibold"}>{props.standingLabel}</Text><Text size={"xs"} tone={"muted"}>{props.standingFact}</Text></div><Progress label={props.meterLabel} value={props.percent} /></div>
