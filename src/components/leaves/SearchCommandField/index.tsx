"use client"

import { Input as HeroInput, Kbd, Spinner } from "@heroui/react"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { searchCommandFieldActionsClassName, searchCommandFieldClassName, searchCommandFieldIconClassName, searchCommandFieldInputClassName } from "./classNames"

/** Resolved controlled value and accessible command-field copy. */
export type SearchCommandFieldData = {
    readonly id: string
    readonly value: string
    readonly label: string
    readonly placeholder: string
    readonly clearLabel: string
    readonly shortcut?: string
    readonly activeDescendant?: string
    readonly isPending?: boolean
}

/** Named editing and keyboard-navigation outcomes from the command field. */
export type SearchCommandFieldActions = {
    readonly change?: (value: string) => void
    readonly clear?: () => void
    readonly previous?: () => void
    readonly next?: () => void
    readonly submit?: () => void
}

/** Closed data/action slots accepted by the search command primitive. */
export type SearchCommandFieldProps = { readonly props: SearchCommandFieldData; readonly on?: SearchCommandFieldActions; readonly isLoading?: boolean }

/** Controlled command input translating navigation keys into named search outcomes. */
export const SearchCommandField = (props: SearchCommandFieldProps) => {
    const data = props.props
    const on = props.on
    return (
        <span className={searchCommandFieldClassName}>
            <span className={searchCommandFieldIconClassName}>
                <Icon source={iconSourceFor("search", "leading")} usage={"leading"} />
            </span>
            <HeroInput
                id={data.id}
                aria-label={data.label}
                aria-activedescendant={data.activeDescendant}
                aria-controls="global-search-results"
                role="combobox"
                autoFocus
                value={data.value}
                placeholder={data.placeholder}
                variant="secondary"
                fullWidth
                className={searchCommandFieldInputClassName}
                onChange={(event) => on?.change?.(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                        event.preventDefault()
                        on?.previous?.()
                    } else if (event.key === "ArrowDown") {
                        event.preventDefault()
                        on?.next?.()
                    } else if (event.key === "Enter") {
                        event.preventDefault()
                        on?.submit?.()
                    }
                }}
            />
            <span className={searchCommandFieldActionsClassName}>
                {data.isPending === true
                    ? <Spinner size="sm" aria-label={data.label} />
                    : data.value.length > 0
                        ? (
                            <button type="button" aria-label={data.clearLabel} onClick={on?.clear}>
                                <Icon source={iconSourceFor("close", "chip")} usage={"chip"} />
                            </button>
                        )
                        : data.shortcut === undefined ? null : <Kbd>{data.shortcut}</Kbd>}
            </span>
        </span>
    )
}
