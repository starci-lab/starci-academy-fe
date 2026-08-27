import { Text } from "@/components/leaves/Text"
import { Input, type InputKind } from "@/components/leaves/Input"
import { Label } from "@/components/leaves/Label"

/** Input kind selected by the field owner. */
export type FieldKind = InputKind
/** Resolved label, guidance and control data. */
export type FieldData = { readonly id: string; readonly name: string; readonly label: string; readonly description?: string; readonly kind?: FieldKind; readonly placeholder?: string; readonly hint?: string; readonly isInvalid?: boolean; readonly disabled?: boolean; readonly revealLabel?: string; readonly hideLabel?: string }
/** Change action emitted by the input. */
export type FieldActions = { readonly change?: (value: string) => void }
/** Public inputs for the labelled field composition. */
export type FieldProps = { readonly props: FieldData; readonly on?: FieldActions; readonly isLoading?: boolean }

/** Draw a labelled input with optional description and validation hint. */
export const Field = (props: FieldProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const describedBy = [data.description === undefined ? undefined : `${data.id}-description`, data.hint === undefined ? undefined : `${data.id}-hint`].filter((value): value is string => value !== undefined).join(" ")
    return <div>
        <div><Label props={{ htmlFor: data.id, content: data.label }} />{data.description === undefined ? null : <Text props={{ id: `${data.id}-description`, content: data.description, size: "xs", tone: "muted" }} />}</div>
        <Input props={{ id: data.id, name: data.name, kind: data.kind, placeholder: data.placeholder, disabled: data.disabled, isInvalid: data.isInvalid, describedBy: describedBy === "" ? undefined : describedBy, revealLabel: data.revealLabel, hideLabel: data.hideLabel }} on={{ change: on?.change }} isLoading={isLoading} />
        {data.hint === undefined ? null : <Text props={{ id: `${data.id}-hint`, content: data.hint, size: "xs", live: data.isInvalid === true ? "assertive" : "off" }} />}
    </div>
}
