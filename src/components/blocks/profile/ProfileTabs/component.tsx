"use client"

import { useEffect, useRef } from "react"
import { ExtendedTabs, type ExtendedTab } from "@/components/leaves/ExtendedTabs"
import { profileTabsClassName, profileTabsEndCueClassName, profileTabsStartCueClassName } from "./classNames"

/** Route-derived public-profile destinations resolved by the persistent layout. */
export type ProfileTabsData = {
    readonly label: string
    readonly selectedKey: string
    readonly tabs: ReadonlyArray<ExtendedTab>
    readonly labelVisibility?: "responsive" | "always"
}

/** The one outcome exposed by profile route chrome. */
export type ProfileTabsActions = { readonly select?: (key: string) => void }

/** The tab set this chrome draws, plus the one outcome it reports. */
export type ProfileTabsProps = { readonly props: ProfileTabsData, readonly on?: ProfileTabsActions }

/** Draw profile-owned route chrome without borrowing the global navbar owner. */
export const ProfileTabsBase = (props: ProfileTabsProps) => {
    const rootRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const root = rootRef.current
        if (!root) return
        const revealSelected = () => {
            const region = root.querySelector<HTMLElement>("[data-grammar-tabs-overflow=\"scroll\"]")
            const selected = region?.querySelector<HTMLElement>("[role=\"tab\"][aria-selected=\"true\"]")
            if (!selected || typeof selected.scrollIntoView !== "function") return
            selected.scrollIntoView({ block: "nearest", inline: "nearest" })
        }
        const observer = new MutationObserver(revealSelected)
        observer.observe(root, { attributes: true, childList: true, subtree: true, attributeFilter: ["aria-selected", "data-selected"] })
        revealSelected()
        return () => observer.disconnect()
    }, [props.props.selectedKey])
    return <div ref={rootRef} className={profileTabsClassName} data-profile-tabs-overflow="discoverable">
        <span aria-hidden="true" className={profileTabsStartCueClassName}>‹</span>
        <ExtendedTabs props={props.props} on={{ select: props.on?.select }} />
        <span aria-hidden="true" className={profileTabsEndCueClassName}>›</span>
    </div>
}

/** Source-level marker for the pure profile route-chrome block. */
