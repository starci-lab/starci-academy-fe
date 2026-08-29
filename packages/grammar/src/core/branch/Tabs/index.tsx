"use client"

import { Tabs as HeroTabs } from "@heroui/react"
import type { ReactNode } from "react"
import { HorizontalScrollRegion } from "../../composite/HorizontalScrollRegion/index.js"
import {
    tabContentClassName,
    tabLabelClassName,
    tabsClassName,
    tabsFrameClassName,
    tabsScrollClassName,
} from "./classNames.js"

/** One stable peer destination rendered by the Core tab object. */
export type TabItem = {
    readonly id: string
    readonly label: string
    readonly leading?: ReactNode
}

/** Business-neutral controlled peer tabs with one declared overflow owner. */
export type TabsProps = {
    readonly label: string
    readonly selectedKey: string
    readonly items: ReadonlyArray<TabItem>
    readonly onSelect?: (key: string) => void
    readonly panelId?: (key: string) => string
}

/** Render peer tabs through Core's selected, accessible and responsive treatment. */
export const Tabs = (props: TabsProps) => (
    <div className={tabsFrameClassName} data-grammar-tabs="true">
        <HorizontalScrollRegion className={tabsScrollClassName} data-grammar-tabs-overflow="scroll">
            <HeroTabs
                variant="secondary"
                selectedKey={props.selectedKey}
                onSelectionChange={(key) => props.onSelect?.(String(key))}
                className={tabsClassName ?? ""}
            >
                <HeroTabs.ListContainer>
                    <HeroTabs.List aria-label={props.label}>
                        {props.items.map((item) => (
                            <HeroTabs.Tab
                                key={item.id}
                                id={item.id}
                                aria-label={item.label}
                                aria-controls={props.panelId?.(item.id)}
                            >
                                <span className={tabContentClassName}>
                                    {item.leading}
                                    <span className={tabLabelClassName}>{item.label}</span>
                                </span>
                                <HeroTabs.Indicator />
                            </HeroTabs.Tab>
                        ))}
                    </HeroTabs.List>
                </HeroTabs.ListContainer>
            </HeroTabs>
        </HorizontalScrollRegion>
    </div>
)
