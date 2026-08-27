"use client"

import { ListBox } from "@heroui/react"
import type { IconName } from "@/components/leaves/Icon"
import { IconLabelFactRow } from "@/components/composites/IconLabelFactRow"
import { quickActionsListClassName, quickActionsListItemClassName } from "./classNames"

/** One destination in the legacy quick-access ListBox. */
export type QuickActionItem = {
    readonly id: string
    readonly label: string
    readonly icon: IconName
}

/** Resolved copy and items for the quick-access ListBox. */
export type QuickActionsListData = {
    readonly label: string
    readonly items: ReadonlyArray<QuickActionItem>
}

/** Selection reported by the quick-access ListBox. */
export type QuickActionsListActions = {
    readonly activate?: (id: string) => void
}

/** Fixed data and action slots for the quick-access ListBox. */
export type QuickActionsListProps = {
    readonly props: QuickActionsListData
    readonly on?: QuickActionsListActions
}

/** Draw the original native HeroUI ListBox chrome used by the legacy dashboard rail. */
export const QuickActionsList = (props: QuickActionsListProps) => (
    <ListBox
        aria-label={props.props.label}
        selectionMode="none"
        onAction={(key) => props.on?.activate?.(String(key))}
        className={quickActionsListClassName}
    >
        {props.props.items.map((item) => (
            <ListBox.Item
                key={item.id}
                id={item.id}
                textValue={item.label}
                className={quickActionsListItemClassName}
            >
                <IconLabelFactRow props={{ icon: item.icon, label: item.label, recipe: "compact-action" }} />
            </ListBox.Item>
        ))}
    </ListBox>
)
