"use client"

import { Input as HeroInput, Kbd, Spinner } from "@heroui/react"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

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
export type SearchCommandFieldProps = LeafProps<SearchCommandFieldData, SearchCommandFieldActions>

/** Controlled command input translating navigation keys into named search outcomes. */
export const SearchCommandField = ({ props, on }: SearchCommandFieldProps) => (
    <span data-tier="leaf" data-component="SearchCommandField" className="relative flex w-full items-center">
        <span className="pointer-events-none absolute left-3 z-10 text-muted">
            <Icon props={{ name: "search", role: "leading" }} />
        </span>
        <HeroInput
            id={props.id}
            aria-label={props.label}
            aria-activedescendant={props.activeDescendant}
            aria-controls="global-search-results"
            role="combobox"
            autoFocus
            value={props.value}
            placeholder={props.placeholder}
            variant="secondary"
            fullWidth
            className="px-10"
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
        <span className="absolute right-3 z-10 inline-flex items-center">
            {props.isPending === true
                ? <Spinner size="sm" aria-label={props.label} />
                : props.value.length > 0
                    ? (
                        <button type="button" aria-label={props.clearLabel} onClick={on?.clear}>
                            <Icon props={{ name: "close", role: "chip" }} />
                        </button>
                    )
                    : props.shortcut === undefined ? null : <Kbd>{props.shortcut}</Kbd>}
        </span>
    </span>
)

/** Source-level tier marker for the controlled command primitive. */
export const meta = { shape: "leaf", world: "pure" } as const
