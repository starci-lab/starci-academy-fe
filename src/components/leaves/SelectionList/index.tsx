"use client"

import { ListBox } from "@heroui/react"
import { useEffect } from "react"
import type { Key } from "react"
import { selectionListBadgeClassName, selectionListCollapsedClassName, selectionListCompactIconClassName, selectionListDescriptionClassName, selectionListItemClassNames, selectionListLabelClassName, selectionListMetaClassName, selectionListOutlineContentClassName, selectionListResultContentClassName, selectionListResultLabelClassName, selectionListResultTextClassName } from "./classNames"
import { Icon } from "@starci/grammar/common"
import { iconSourceFor, type IconName } from "@/components/leaves/Icon"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import type { BadgeTone } from "@starci/grammar/common"

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
export type SelectionListProps = { readonly props: SelectionListData; readonly on?: SelectionListActions; readonly isLoading?: boolean }

const firstKey = (keys: "all" | Set<Key>): string | undefined => {
    if (keys === "all") return undefined
    const value = keys.values().next().value
    return value === undefined ? undefined : String(value)
}

/** Draw one single-selection ListBox with fixed scope, result or course-outline anatomy. */
export const SelectionList = (props: SelectionListProps) => {
    const data = props.props
    const on = props.on
    const isLoading = props.isLoading ?? false
    const listId = data.id ?? (data.variant === "results" ? "global-search-results" : undefined)

    useEffect(() => {
        if (data.variant !== "outline" || data.selectedKey === undefined || listId === undefined) return
        const list = document.getElementById(listId)
        const selected = Array.from(list?.querySelectorAll<HTMLElement>("[data-item-id]") ?? [])
            .find((item) => item.dataset.itemId === data.selectedKey)
        selected?.scrollIntoView({ block: "nearest" })
    }, [data.selectedKey, data.variant, listId])

    return (
        <ListBox
            data-variant={data.variant}
            id={listId}
            aria-label={data.label}
            className={data.variant === "navigation-collapsed" ? selectionListCollapsedClassName : undefined}
            selectionMode="single"
            selectedKeys={data.selectedKey === undefined ? [] : [data.selectedKey]}
            onSelectionChange={(keys) => {
                const key = firstKey(keys as "all" | Set<Key>)
                if (key === undefined) return
                if (data.variant !== "outline" && data.variant !== "navigation" && data.variant !== "navigation-collapsed") on?.select?.(key)
            }}
            onAction={(key) => {
                if (data.variant === "results") on?.select?.(String(key))
                if (data.variant === "scopes") on?.activate?.(String(key))
            }}
        >
            {data.items.map((item) => (
                <ListBox.Item
                    key={item.id}
                    id={item.id}
                    data-item-id={item.id}
                    textValue={item.textValue}
                    aria-label={data.variant === "navigation-collapsed" ? item.title : undefined}
                    isDisabled={item.isDisabled === true || (isLoading && data.items.length === 0)}
                    onClick={() => {
                        if (data.variant === "outline" || data.variant === "navigation" || data.variant === "navigation-collapsed") on?.activate?.(item.id)
                    }}
                    onKeyDown={(event) => {
                        if (data.variant !== "results" && event.key === "Enter") {
                            on?.activate?.(item.id)
                        }
                    }}
                    className={selectionListItemClassNames[data.variant]}
                >
                    {data.variant === "outline" ? (
                        <span className={selectionListOutlineContentClassName}>
                            <Icon source={iconSourceFor(item.icon ?? "pending", "leading")} usage={"leading"} />
                            <span data-slot="label" className={selectionListLabelClassName}>
                                {item.title}
                            </span>
                            {item.meta === undefined ? null : (
                                <span data-slot="meta" className={selectionListMetaClassName}>{item.meta}</span>
                            )}
                        </span>
                    ) : data.variant === "navigation-collapsed" ? (
                        <span
                            data-slot="compact-icon"
                            className={selectionListCompactIconClassName}
                        >
                            <Icon source={iconSourceFor(item.icon ?? "pending", "leading")} usage={"leading"} />
                        </span>
                    ) : data.variant === "scopes" || data.variant === "navigation" ? (
                        <IconLabelFactRow props={{
                            icon: item.icon ?? "pending",
                            label: item.title,
                            endText: data.variant === "navigation" && item.badge !== undefined
                                ? undefined
                                : item.badge ?? item.meta,
                            endBadge: data.variant !== "navigation" || item.badge === undefined ? undefined : {
                                content: item.badge,
                                tone: item.badgeTone ?? "neutral",
                            },
                            recipe: "compact-action",
                        }} />
                    ) : (
                        <span className={selectionListResultContentClassName}>
                            <span className={selectionListResultTextClassName}>
                                <span
                                    data-slot="label"
                                    className={selectionListResultLabelClassName}
                                >
                                    {item.title}
                                </span>
                                {item.description === undefined ? null : (
                                    <span data-slot="description" className={selectionListDescriptionClassName}>
                                        {item.description}
                                    </span>
                                )}
                            </span>
                            {item.badge === undefined ? null : (
                                <span className={selectionListBadgeClassName}>
                                    {item.badge}
                                </span>
                            )}
                        </span>
                    )}
                    {data.variant === "results" ? <ListBox.ItemIndicator /> : null}
                </ListBox.Item>
            ))}
        </ListBox>
    )
}
