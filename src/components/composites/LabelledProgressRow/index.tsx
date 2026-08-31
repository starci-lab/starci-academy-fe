import { Text, type TextWeight } from "@/components/leaves/Text"
import { Progress } from "@/components/leaves/Progress"

/** Resolved label and progress values. */
export type LabelledProgressRowData = { readonly id: string; readonly title?: string; readonly percent?: number; readonly percentText?: string }
/** Public inputs for a labelled progress row. */
export type LabelledProgressRowProps = { readonly props: LabelledProgressRowData; readonly isLoading?: boolean; readonly titleWeight?: TextWeight }

/** Draw one named thing's label, figure and progress bar. */
export const LabelledProgressRow = (props: LabelledProgressRowProps) => {
    const { props: data, isLoading = false, titleWeight = "semibold" } = props
    return <div>
        <div><Text props={{ content: data.title, size: "sm", weight: titleWeight }} isLoading={isLoading} /><Text props={{ content: data.percentText, size: "xs" }} isLoading={isLoading} /></div>
        <Progress props={{ value: data.percent, label: data.title ?? "" }} isLoading={isLoading} />
    </div>
}
