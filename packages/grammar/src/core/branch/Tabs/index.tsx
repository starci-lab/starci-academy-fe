"use client"

import { Tabs as HeroTabs } from "@heroui/react"
import { useEffect, useState, type ReactNode } from "react"
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
}

/** Render peer tabs through Core's selected, accessible and responsive treatment. */
export const Tabs = (props: TabsProps) => {
    const [isClientReady, setIsClientReady] = useState(false)
    useEffect(() => setIsClientReady(true), [])

    if (!isClientReady) return <div aria-hidden="true" className={tabsFrameClassName} data-grammar-tabs="true" data-grammar-tabs-client="pending" style={{ minHeight: "3rem" }} />

    return <div className={tabsFrameClassName} data-grammar-tabs="true" data-grammar-tabs-client="ready" data-grammar-tab-labels={props.labelVisibility ?? "responsive"}>
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
                                style={{ paddingInline: "clamp(0.5rem, 3vw, 1rem)" }}
                            >
                                <span className={tabContentClassName}>
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
