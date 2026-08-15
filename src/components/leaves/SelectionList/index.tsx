"use client"

import { ListBox } from "@heroui/react"
import type { Key } from "react"
import type { LeafProps } from "@/components/contracts/props"
import { Icon, type IconName } from "@/components/leaves/Icon"

/** One closed row accepted by the reusable search selection list. */
export type SelectionListItem = {
    readonly id: string
    readonly textValue: string
    readonly title: string
    readonly icon?: IconName
    readonly description?: string
    readonly badge?: string
}

/** Resolved list identity, rows and current selection. */
export type SelectionListData = {
    readonly label: string
    readonly items: ReadonlyArray<SelectionListItem>
    readonly selectedKey?: string
    readonly variant: "scopes" | "results"
}

/** Named outcomes reported by selection and activation. */
export type SelectionListActions = {
    readonly select?: (key: string) => void
    readonly activate?: (key: string) => void
}

/** Closed data/action slots for the HeroUI ListBox leaf. */
export type SelectionListProps = LeafProps<SelectionListData, SelectionListActions>

const firstKey = (keys: "all" | Set<Key>): string | undefined => {
    if (keys === "all") return undefined
    const value = keys.values().next().value
    return value === undefined ? undefined : String(value)
}

/** Draw one single-selection ListBox with fixed scope or result row anatomy. */
export const SelectionList = ({ props, on, isLoading = false }: SelectionListProps) => (
    <ListBox
        data-tier="leaf"
        data-component="SelectionList"
        data-variant={props.variant}
        id={props.variant === "results" ? "global-search-results" : undefined}
        aria-label={props.label}
        selectionMode="single"
        selectedKeys={props.selectedKey === undefined ? [] : [props.selectedKey]}
        onSelectionChange={(keys) => {
            const key = firstKey(keys as "all" | Set<Key>)
            if (key !== undefined) on?.select?.(key)
        }}
        onAction={(key) => props.variant === "results"
            ? on?.select?.(String(key))
            : on?.activate?.(String(key))}
    >
        {props.items.map((item) => (
            <ListBox.Item
                key={item.id}
                id={item.id}
                textValue={item.textValue}
                isDisabled={isLoading && props.items.length === 0}
                onKeyDown={(event) => {
                    if (props.variant === "scopes" && event.key === "Enter") on?.activate?.(item.id)
                }}
                className={props.variant === "scopes"
                    ? "group min-h-11 cursor-pointer rounded-large px-2 py-2 text-foreground outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent data-[hovered=true]:bg-default data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground"
                    : "items-start py-3"}
            >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                    {props.variant === "scopes" && item.icon !== undefined
                        ? <Icon props={{ name: item.icon, role: "leading" }} />
                        : null}
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span
                            data-slot="label"
                            className={props.variant === "scopes"
                                ? "truncate text-sm font-medium text-current"
                                : "truncate text-sm font-medium text-foreground"}
                        >
                            {item.title}
                        </span>
                        {item.description === undefined ? null : (
                            <span data-slot="description" className="truncate text-xs text-muted">
                                {item.description}
                            </span>
                        )}
                    </span>
                    {item.badge === undefined ? null : (
                        <span className={props.variant === "scopes"
                            ? "shrink-0 text-xs text-muted group-hover:text-accent-soft"
                            : "shrink-0 rounded-full bg-default px-2 py-1 text-xs text-muted"}
                        >
                            {item.badge}
                        </span>
                    )}
                </span>
                {props.variant === "results" ? <ListBox.ItemIndicator /> : null}
            </ListBox.Item>
        ))}
    </ListBox>
)

/** Source-level tier marker for the closed selection primitive. */
export const meta = { shape: "leaf", world: "pure" } as const
