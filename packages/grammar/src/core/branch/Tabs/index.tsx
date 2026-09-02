"use client"

import { Tabs as HeroTabs } from "@heroui/react"
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react"
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
    /** Keep stable labels visible when icon-only navigation would make peer views ambiguous. */
    readonly labelVisibility?: "responsive" | "always"
    /** Page chrome owns whether the peer strip starts at the shared page inset. */
    readonly inset?: "page" | "none"
}

/** Render peer tabs through Core's selected, accessible and responsive treatment. */
export const Tabs = (props: TabsProps) => {
    const [isClientReady, setIsClientReady] = useState(false)
    const frameRef = useRef<HTMLDivElement>(null)
    useEffect(() => setIsClientReady(true), [])
    useLayoutEffect(() => {
        if (!isClientReady || props.panelId === undefined) return
        frameRef.current?.querySelectorAll<HTMLElement>("[data-grammar-tab-id]").forEach((identity) => {
            const itemId = identity.dataset.grammarTabId
            const tab = identity.closest<HTMLElement>("[role='tab']")
            if (itemId !== undefined && tab !== null) tab.setAttribute("aria-controls", props.panelId?.(itemId) ?? "")
        })
    }, [isClientReady, props.items, props.panelId])

    const inset = props.inset ?? "none"
    if (!isClientReady) return <div aria-hidden="true" className={tabsFrameClassName} data-grammar-tabs="true" data-grammar-tabs-client="pending" data-grammar-tabs-inset={inset} style={{ minHeight: "3rem" }} />

    return <div ref={frameRef} className={tabsFrameClassName} data-grammar-tabs="true" data-grammar-tabs-client="ready" data-grammar-tabs-inset={inset} data-grammar-tab-labels={props.labelVisibility ?? "responsive"}>
        <HorizontalScrollRegion className={tabsScrollClassName} data-grammar-tabs-overflow="scroll" hideScrollBar>
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
                                <span className={tabContentClassName} data-grammar-tab-id={item.id}>
                                    {item.leading}
                                    <span className={tabLabelClassName} style={props.labelVisibility === "always" ? { display: "inline" } : undefined}>{item.label}</span>
                                </span>
                                <HeroTabs.Indicator />
                            </HeroTabs.Tab>
                        ))}
                    </HeroTabs.List>
                </HeroTabs.ListContainer>
            </HeroTabs>
        </HorizontalScrollRegion>
    </div>
}
