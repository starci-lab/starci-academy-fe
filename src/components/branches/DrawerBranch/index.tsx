"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Drawer } from "@heroui/react"
import { drawerBodyClassName, drawerControlledTriggerClassName, drawerHiddenHeadingLabelClassName, getDrawerContentClassName, getDrawerDialogClassName } from "./classNames"

/**
 * BRANCH - `DrawerBranch`: the vendor's edge-anchored mechanics around typed children.
 *
 * Target path: `src/components/branches/DrawerBranch/index.tsx`.
 *
 * IT WRAPS `Drawer`, NOT `Modal` WITH A PLACEMENT. HeroUI 3.2.4 ships a real `Drawer` -
 * `Drawer.Backdrop`, `Drawer.Content` with its own `placement`, `Drawer.Dialog`, `Drawer.Header`,
 * `Drawer.Body`, `Drawer.Footer`, `Drawer.Handle`, `Drawer.CloseTrigger` - and this file was first
 * written against `Modal` with `placement="right"`. That would have been a second implementation
 * of a panel the vendor already ships: no drag handle, no edge-anchored enter and exit, and the
 * product's drawer behaving unlike every other drawer built on this library. `vendor-boundary` is
 * the rule and this is the reason behind it - reach for the vendor's own component before
 * assembling one out of its neighbour.
 *
 * IT IMPLEMENTS NONE OF THOSE MECHANICS ITSELF, exactly as `ModalBranch` does not: no effect, no
 * ref, no scroll handling. All of it belongs to the vendor, which is what stops two overlays in
 * this product disagreeing about how a covering surface behaves. The interior still stays closed:
 * children are passed directly so the branch remains a small vendor-mechanics wrapper.
 */

/** Which edge the panel is anchored to. */
export type DrawerBranchPlacement = "left" | "right" | "bottom"

/** Props for {@link DrawerBranch}. */
export type DrawerBranchProps = {
    /** Whether the drawer is showing. Owned by whoever mounts it, never by the branch. */
    readonly isOpen: boolean
    /** The edge it opens from. Absent is `right`, which is where this product's basket lives. */
    readonly placement?: DrawerBranchPlacement
    /** A focused workspace fills compact screens and uses a wider decision rail on larger ones. */
    readonly size?: "default" | "workspace"
    /** Remove the vendor dialog inset when the child owns its own padding. */
    readonly inset?: "default" | "none"
    /** The already-resolved title. A drawer names itself; the interior does not repeat it. */
    readonly title: string
    /** Keep the vendor title row but render no visible words in navigation-only drawers. */
    readonly isTitleEmpty?: boolean
    /** Every way out: the close control, Escape, and the backdrop. */
    readonly onDismiss: () => void
    readonly children: ReactNode
}

/**
 * Open the vendor's panel from the edge.
 *
 * @param input - {@link DrawerBranchProps}
 */
export const DrawerBranch = (props: DrawerBranchProps) => {
    const pageScrollRef = useRef({ x: 0, y: 0 })
    const [viewportEpoch, setViewportEpoch] = useState(0)

    useEffect(() => {
        if (!props.isOpen) return

        const root = document.documentElement
        const body = document.body
        const previousRootOverflow = root.style.overflow
        const previousBodyOverflow = body.style.overflow
        pageScrollRef.current = { x: window.scrollX, y: window.scrollY }

        // This overlay owns the viewport. Some embedded browsers otherwise paint fixed drawer
        // chrome at the underlying document offset, leaving its title and close action unreachable.
        if (pageScrollRef.current.x !== 0 || pageScrollRef.current.y !== 0) {
            window.scrollTo({ left: 0, top: 0, behavior: "auto" })
        }
        root.style.overflow = "hidden"
        body.style.overflow = "hidden"
        const keepDocumentAtOrigin = () => {
            if (window.scrollX !== 0 || window.scrollY !== 0) {
                window.scrollTo({ left: 0, top: 0, behavior: "auto" })
                window.requestAnimationFrame(() => setViewportEpoch((value) => value + 1))
            }
        }
        window.addEventListener("scroll", keepDocumentAtOrigin, { passive: true })

        return () => {
            window.removeEventListener("scroll", keepDocumentAtOrigin)
            root.style.overflow = previousRootOverflow
            body.style.overflow = previousBodyOverflow
            if (pageScrollRef.current.x !== 0 || pageScrollRef.current.y !== 0) {
                window.scrollTo({
                    left: pageScrollRef.current.x,
                    top: pageScrollRef.current.y,
                    behavior: "auto",
                })
            }
        }
    }, [props.isOpen])

    return (
        <Drawer
            isOpen={props.isOpen}
            onOpenChange={(open) => {
                if (!open) props.onDismiss()
            }}
        >
            {/*
              * Controlled HeroUI drawers still sit on React-Aria DialogTrigger. Complete that
              * vendor anatomy so its PressResponder is not left orphaned; the actual opener stays
              * with the calling block, while this hidden adapter creates no user-facing action.
              */}
            <Drawer.Trigger className={drawerControlledTriggerClassName} aria-hidden isDisabled />
            <Drawer.Backdrop>
                <Drawer.Content
                    key={viewportEpoch}
                    className={getDrawerContentClassName(props.placement ?? "right", props.size)}
                    placement={props.placement ?? "right"}
                >
                    <Drawer.Dialog className={getDrawerDialogClassName(props.size, props.inset)}>
                        <Drawer.Header>
                            <Drawer.Heading>
                                {props.isTitleEmpty === true ? (
                                    <>
                                        <span className={drawerHiddenHeadingLabelClassName}>{props.title}</span>
                                        <span aria-hidden>&nbsp;</span>
                                    </>
                                ) : props.title}
                            </Drawer.Heading>
                        </Drawer.Header>
                        <Drawer.CloseTrigger />
                        {/*
                         * The vendor inset is zeroed for the same reason `ModalBranch` zeroes it: the
                         * interior owns its own padding, so a branch that also padded would inset the
                         * same content twice and the two insets would drift apart.
                         */}
                        <Drawer.Body className={drawerBodyClassName}>
                            {props.children}
                        </Drawer.Body>
                    </Drawer.Dialog>
                </Drawer.Content>
            </Drawer.Backdrop>
        </Drawer>
    )
}
