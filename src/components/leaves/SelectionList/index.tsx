"use client"

import { ListBox } from "@heroui/react"
import { useEffect } from "react"
import type { Key } from "react"
import type { LeafProps } from "@/components/contracts/props"
import { Icon, type IconName } from "@/components/leaves/Icon"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import type { BadgeTone } from "@/components/leaves/Badge"

/** One closed row accepted by the reusable search selection list. */
export type SelectionListItem = {
    readonly id: string
    readonly textValue: string
    readonly title: string
    readonly icon?: IconName
    readonly description?: string
    readonly badge?: string
    /** Semantic tone when badge is a prominent navigation fact. */
    readonly badgeTone?: BadgeTone
    readonly meta?: string
    readonly isCurrent?: boolean
    readonly isDisabled?: boolean
}

/** Resolved list identity, rows and current selection. */
export type SelectionListData = {
    readonly label: string
    readonly id?: string
    readonly items: ReadonlyArray<SelectionListItem>
    readonly selectedKey?: string
    readonly variant: "scopes" | "results" | "outline" | "navigation" | "navigation-collapsed"
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

const ITEM_CLASSES = {
    scopes: "group min-h-11 rounded-large px-2 py-2 text-foreground data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground data-[selected=true]:data-[hovered=true]:bg-accent-soft",
    results: "items-start py-3",
    outline: "group min-h-11 rounded-medium px-3 py-2 text-foreground data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground data-[selected=true]:data-[hovered=true]:bg-accent-soft",
    navigation: "group min-h-11 rounded-large px-2 py-2 text-foreground data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground data-[selected=true]:data-[hovered=true]:bg-accent-soft",
    "navigation-collapsed": "group flex size-11 min-h-11 shrink-0 items-center justify-center rounded-full bg-transparent p-0 text-foreground data-[hovered=true]:bg-transparent data-[selected=true]:bg-transparent",
} as const

/** Draw one single-selection ListBox with fixed scope, result or course-outline anatomy. */
export const SelectionList = ({ props, on, isLoading = false }: SelectionListProps) => {
    const listId = props.id ?? (props.variant === "results" ? "global-search-results" : undefined)

    useEffect(() => {
        if (props.variant !== "outline" || props.selectedKey === undefined || listId === undefined) return
        const list = document.getElementById(listId)
        const selected = Array.from(list?.querySelectorAll<HTMLElement>("[data-item-id]") ?? [])
            .find((item) => item.dataset.itemId === props.selectedKey)
        selected?.scrollIntoView({ block: "nearest" })
    }, [listId, props.selectedKey, props.variant])

    return (
        <ListBox
            data-tier="leaf"
            data-component="SelectionList"
            data-variant={props.variant}
            id={listId}
            aria-label={props.label}
            className={props.variant === "navigation-collapsed" ? "flex flex-col items-center p-0" : undefined}
            selectionMode="single"
            selectedKeys={props.selectedKey === undefined ? [] : [props.selectedKey]}
            onSelectionChange={(keys) => {
                const key = firstKey(keys as "all" | Set<Key>)
                if (key === undefined) return
                if (props.variant !== "outline" && props.variant !== "navigation" && props.variant !== "navigation-collapsed") on?.select?.(key)
            }}
            onAction={(key) => {
                if (props.variant === "results") on?.select?.(String(key))
                if (props.variant === "scopes") on?.activate?.(String(key))
            }}
        >
            {props.items.map((item) => (
                <ListBox.Item
                    key={item.id}
                    id={item.id}
                    data-item-id={item.id}
                    textValue={item.textValue}
                    aria-label={props.variant === "navigation-collapsed" ? item.title : undefined}
                    isDisabled={item.isDisabled === true || (isLoading && props.items.length === 0)}
                    onClick={() => {
                        if (props.variant === "outline" || props.variant === "navigation" || props.variant === "navigation-collapsed") on?.activate?.(item.id)
                    }}
                    onKeyDown={(event) => {
                        if (props.variant !== "results" && event.key === "Enter") {
                            on?.activate?.(item.id)
                        }
                    }}
                    className={ITEM_CLASSES[props.variant]}
                >
                    {props.variant === "outline" ? (
                        <span className="flex min-w-0 flex-1 items-start gap-3">
                            <Icon props={{ name: item.icon ?? "pending", role: "leading" }} />
                            <span data-slot="label" className="min-w-0 flex-1 text-base font-normal text-foreground">
                                {item.title}
                            </span>
                            {item.meta === undefined ? null : (
                                <span data-slot="meta" className="shrink-0 text-xs text-muted">{item.meta}</span>
                            )}
                        </span>
                    ) : props.variant === "navigation-collapsed" ? (
                        <span
                            data-slot="compact-icon"
                            className="grid size-9 place-items-center rounded-full group-data-[hovered=true]:bg-default/40 group-data-[selected=true]:bg-accent-soft group-data-[selected=true]:text-accent-soft-foreground group-data-[selected=true]:group-data-[hovered=true]:bg-accent-soft"
                        >
                            <Icon props={{ name: item.icon ?? "pending", role: "leading" }} />
                        </span>
                    ) : props.variant === "scopes" || props.variant === "navigation" ? (
                        <IconLabelFactRow props={{
                            icon: item.icon ?? "pending",
                            label: item.title,
                            endText: props.variant === "navigation" && item.badge !== undefined
                                ? undefined
                                : item.badge ?? item.meta,
                            endBadge: props.variant !== "navigation" || item.badge === undefined ? undefined : {
                                content: item.badge,
                                tone: item.badgeTone ?? "neutral",
                            },
                            recipe: "compact-action",
                        }} />
                    ) : (
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="flex min-w-0 flex-1 flex-col gap-1">
                                <span
                                    data-slot="label"
                                    className="truncate text-sm font-medium text-foreground"
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
                                <span className="shrink-0 rounded-full bg-default px-2 py-1 text-xs text-muted">
                                    {item.badge}
                                </span>
                            )}
                        </span>
                    )}
                    {props.variant === "results" ? <ListBox.ItemIndicator /> : null}
                </ListBox.Item>
            ))}
        </ListBox>
    )
}

/** Source-level tier marker for the closed selection primitive. */
export const meta = { shape: "leaf", world: "pure" } as const
