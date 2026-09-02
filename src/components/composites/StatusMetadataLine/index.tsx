import { Badge, Icon, Text, type BadgeTone } from "@starci/grammar/common"
import { iconSourceFor, type IconName } from "@/components/leaves/Icon"

/** Optional status chip data. */
export type StatusMetadataLineStatus = { readonly content: string; readonly tone: BadgeTone; readonly icon?: IconName }
/** Status and ordinary metadata facts. */
export type StatusMetadataLineData = { readonly status?: StatusMetadataLineStatus; readonly facts: ReadonlyArray<string> }
/** Public inputs for the metadata line. */
export type StatusMetadataLineProps = { readonly props: StatusMetadataLineData; readonly isLoading?: boolean }

/** Draw an optional status chip followed by one readable fact sentence. */
export const StatusMetadataLine = (props: StatusMetadataLineProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    const facts = data.facts.filter((fact) => fact.trim() !== "").join(" · ")
    return <div>{data.status === undefined ? null : <Badge tone={data.status.tone} startContent={data.status.icon === undefined ? undefined : <Icon source={iconSourceFor(data.status.icon, "chip")} usage="chip" />} isSkeleton={isLoading}>{data.status.content}</Badge>}{facts === "" ? null : <Text size={"sm"} tone={"muted"} isSkeleton={isLoading}>{facts}</Text>}</div>
}
