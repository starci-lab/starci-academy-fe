"use client"

import { Header, ListBox } from "@heroui/react"
import type { Key, ReactNode } from "react"
import { Icon, type IconSource } from "../../primitive/Icon/index.js"
import { IconButton } from "../../primitive/IconButton/index.js"

export type SidebarItem = {
    readonly id: string
    readonly label: string
    readonly source?: IconSource
    readonly trailing?: ReactNode
    readonly isDisabled?: boolean
}

export type SidebarGroup = {
    readonly id: string
    readonly label?: string
    readonly items: ReadonlyArray<SidebarItem>
}

export type SidebarProps = {
    readonly label: string
    readonly groups: ReadonlyArray<SidebarGroup>
    readonly selectedKey?: string
    readonly presentation?: "rail" | "drawer"
    readonly isCollapsed?: boolean
    readonly collapseLabel?: string
    readonly expandLabel?: string
    readonly toggleSource?: IconSource
    readonly header?: ReactNode
    readonly footer?: ReactNode
    readonly onAction?: (id: string) => void
    readonly onCollapsedChange?: (collapsed: boolean) => void
}

/**
 * Sections and items share ONE key namespace inside the collection.
 *
 * A caller naturally writes `{ id: "home", items: [{ id: "home" }] }` - the group that holds the
 * home destination, named after it. That duplicate key made the collection unresolvable: every
 * section after the first was dropped from the render, and a re-render (collapsing the rail) sent
 * reconciliation into a loop that never settled, which under Vitest reads as a worker that never
 * reports. Prefixing the section key keeps the caller's vocabulary free: a group id and an item id
 * may be the same word, because only the item id is ever a real collection key.
 */
const sectionKey = (id: string) => `sidebar-section:${id}`

const firstKey = (keys: "all" | Set<Key>): string | undefined => {
    if (keys === "all") return undefined
    const value = keys.values().next().value
    return value === undefined ? undefined : String(value)
}

/** Shared grouped sidebar renderer; apps own route, permission, copy and persistence policy. */
export const Sidebar = ({
    label,
    groups,
    selectedKey,
    presentation = "rail",
    isCollapsed = false,
    collapseLabel,
    expandLabel,
    toggleSource,
    header,
    footer,
    onAction,
    onCollapsedChange,
}: SidebarProps) => {
    const collapsed = presentation === "rail" && isCollapsed
    const toggleLabel = collapsed ? expandLabel : collapseLabel
    const canToggle = presentation === "rail" && toggleSource !== undefined && toggleLabel !== undefined && onCollapsedChange !== undefined

    return (
        <div
            data-tier="composition"
            data-component="Sidebar"
            data-presentation={presentation}
            data-collapsed={collapsed ? "true" : "false"}
            className={[
                "flex min-h-0 flex-col overflow-hidden bg-background text-foreground",
                presentation === "drawer" ? "w-full" : collapsed ? "h-full w-16" : "h-full w-64",
                presentation === "rail" ? "border-r border-separator transition-[width] motion-reduce:transition-none" : "",
            ].join(" ")}
        >
            {canToggle ? (
                <div className={collapsed ? "flex justify-center p-2" : "flex justify-end p-2"}>
                    <IconButton
                        source={toggleSource}
                        label={toggleLabel}
                        isActive={collapsed}
                        onPress={() => onCollapsedChange(!collapsed)}
                    />
                </div>
            ) : null}
            {collapsed || header == null ? null : <div className="px-3 pb-3">{header}</div>}
            <ListBox
                aria-label={label}
                selectionMode="single"
                selectedKeys={selectedKey === undefined ? [] : [selectedKey]}
                onSelectionChange={(keys) => {
                    const key = firstKey(keys as "all" | Set<Key>)
                    if (key !== undefined) onAction?.(key)
                }}
                className={collapsed ? "min-h-0 flex-1 items-center gap-1 overflow-y-auto p-2" : "min-h-0 flex-1 gap-1 overflow-y-auto p-3"}
            >
                {groups.map((group) => (
                    <ListBox.Section
                        key={group.id}
                        id={sectionKey(group.id)}
                        className={collapsed ? "flex flex-col items-center gap-1" : "flex flex-col gap-1"}
                    >
                        {group.label === undefined ? null : (
                            <Header className={collapsed ? "sr-only" : "px-2 pb-1 pt-3 text-xs font-medium text-muted"}>
                                {group.label}
                            </Header>
                        )}
                        {group.items.map((item) => (
                            <ListBox.Item
                                key={item.id}
                                id={item.id}
                                textValue={item.label}
                                className={collapsed
                                    ? "group flex size-11 cursor-pointer items-center justify-center rounded-full text-foreground outline-none data-[disabled=true]:cursor-default data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent data-[hovered=true]:bg-default data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground"
                                    : "flex cursor-pointer items-center gap-3 rounded-large px-3 py-2 text-foreground outline-none data-[disabled=true]:cursor-default data-[disabled=true]:opacity-50 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent data-[hovered=true]:bg-default data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground"}
                                {...(collapsed ? { "aria-label": item.label } : {})}
                                {...(item.isDisabled === undefined ? {} : { isDisabled: item.isDisabled })}
                            >
                                {item.source === undefined ? null : <Icon source={item.source} usage="leading" />}
                                {collapsed ? null : <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>}
                                {collapsed || item.trailing == null ? null : <span className="shrink-0">{item.trailing}</span>}
                            </ListBox.Item>
                        ))}
                    </ListBox.Section>
                ))}
            </ListBox>
            {collapsed || footer == null ? null : <div className="p-3 pt-0">{footer}</div>}
        </div>
    )
}
