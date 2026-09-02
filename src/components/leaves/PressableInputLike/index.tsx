import { Button, Kbd } from "@heroui/react"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { pressableInputLikeClassName, pressableInputLikeContentClassName, pressableInputLikePlaceholderClassName } from "./classNames"

/** Copy shown by the navbar's input-looking press target. */
export type PressableInputLikeData = {
    readonly placeholder: string
    readonly label: string
    readonly shortcut?: string
}

/** What pressing the input-looking control reports. */
export type PressableInputLikeActions = {
    readonly press?: () => void
}

/** Fixed props for the navbar search trigger. */
export type PressableInputLikeProps = { readonly props: PressableInputLikeData; readonly on?: PressableInputLikeActions; readonly isLoading?: boolean }

/**
 * Draw a button with the exact field appearance used by the legacy navbar.
 * It never accepts text: the whole field is one press target that opens search.
 */
export const PressableInputLike = (props: PressableInputLikeProps) => {
    const data = props.props
    const on = props.on
    return (
        <Button
            variant="outline"
            aria-label={data.label}
            onPress={on?.press}
            className={pressableInputLikeClassName}
        >
            <span className={pressableInputLikeContentClassName}>
                <Icon source={iconSourceFor("search", "leading")} role={"leading"} />
                <span className={pressableInputLikePlaceholderClassName}>{data.placeholder}</span>
            </span>
            {data.shortcut === undefined ? null : <Kbd>{data.shortcut}</Kbd>}
        </Button>
    )
}
