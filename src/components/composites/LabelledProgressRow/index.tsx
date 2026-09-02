import { Text, type TextWeight } from "@starci/grammar/common"
import { Progress } from "@starci/grammar/common"

/** Resolved label and progress values. */
export type LabelledProgressRowData = { readonly id: string; readonly title?: string; readonly percent?: number; readonly percentText?: string }
/** Public inputs for a labelled progress row. */
export type LabelledProgressRowProps = { readonly props: LabelledProgressRowData; readonly isLoading?: boolean; readonly titleWeight?: TextWeight }

/** Draw one named thing's label, figure and progress bar. */
export const LabelledProgressRow = (props: LabelledProgressRowProps) => {
    const { props: data, isLoading = false, titleWeight = "semibold" } = props
    return <div>
        <div><Text size={"sm"} weight={titleWeight} isSkeleton={isLoading}>{data.title}</Text><Text size={"xs"} isSkeleton={isLoading}>{data.percentText}</Text></div>
        <Progress label={data.title ?? ""} value={data.percent} isSkeleton={isLoading} />
    </div>
}
