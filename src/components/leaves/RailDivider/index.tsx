"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import type { LeafProps } from "@/components/contracts/props"

/** Width policy and accessible identity for one adjustable rail separator. */
export type RailDividerData = {
    readonly label: string
    readonly storageKey: string
    readonly defaultWidth: number
    readonly minWidth: number
    readonly maxWidth: number
}

/** Closed props for the pointer- and keyboard-adjustable separator. */
export type RailDividerProps = LeafProps<RailDividerData>

// The separator is a real eight-pixel rail rather than an invisible zero-width hit target. That
// keeps the adjustable boundary discoverable while the hairline still sits on the shared edge.
const DIVIDER_CLASSES = "group relative hidden w-2 shrink-0 cursor-col-resize self-stretch bg-background outline-none before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-separator before:transition-colors hover:before:bg-accent focus-visible:before:bg-accent md:sticky md:top-16 md:block md:h-app-rail"
const HANDLE_CLASSES = "pointer-events-none absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/50 transition-colors group-hover:bg-accent group-focus-visible:bg-accent"

/** Draw one separator that publishes its rail width to the containing contract frame. */
export const RailDivider = ({ props }: RailDividerProps) => {
    const dividerRef = useRef<HTMLDivElement>(null)
    const widthRef = useRef(props.defaultWidth)
    const dragRef = useRef<{ readonly startX: number, readonly startWidth: number } | null>(null)
    const [width, setWidth] = useState(props.defaultWidth)

    const clamp = useCallback(
        (value: number) => Math.min(Math.max(value, props.minWidth), props.maxWidth),
        [props.maxWidth, props.minWidth],
    )

    const applyWidth = useCallback((value: number) => {
        const next = clamp(value)
        widthRef.current = next
        setWidth(next)
        const rail = dividerRef.current?.previousElementSibling
        if (rail instanceof HTMLElement) rail.style.width = `${next}px`
    }, [clamp])

    useEffect(() => {
        const stored = window.localStorage.getItem(props.storageKey)
        const parsed = stored === null ? props.defaultWidth : Number(stored)
        applyWidth(Number.isFinite(parsed) ? parsed : props.defaultWidth)
        return () => {
            const rail = dividerRef.current?.previousElementSibling
            if (rail instanceof HTMLElement) rail.style.removeProperty("width")
        }
    }, [applyWidth, props.defaultWidth, props.storageKey])

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        dragRef.current = { startX: event.clientX, startWidth: widthRef.current }
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
    }

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (dragRef.current === null) return
        applyWidth(dragRef.current.startWidth + event.clientX - dragRef.current.startX)
    }

    const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (dragRef.current === null) return
        dragRef.current = null
        event.currentTarget.releasePointerCapture?.(event.pointerId)
        document.body.style.removeProperty("cursor")
        document.body.style.removeProperty("user-select")
        window.localStorage.setItem(props.storageKey, String(Math.round(widthRef.current)))
    }

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return
        event.preventDefault()
        const step = event.shiftKey ? 32 : 16
        const next = event.key === "Home"
            ? props.minWidth
            : event.key === "End"
                ? props.maxWidth
                : widthRef.current + (event.key === "ArrowLeft" ? -step : step)
        applyWidth(next)
        window.localStorage.setItem(props.storageKey, String(Math.round(widthRef.current)))
    }

    return (
        <div
            ref={dividerRef}
            data-tier="leaf"
            data-component="RailDivider"
            role="separator"
            aria-orientation="vertical"
            aria-label={props.label}
            aria-valuemin={props.minWidth}
            aria-valuemax={props.maxWidth}
            aria-valuenow={Math.round(width)}
            tabIndex={0}
            className={DIVIDER_CLASSES}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
        >
            <span aria-hidden="true" data-component="RailDividerHandle" className={HANDLE_CLASSES} />
        </div>
    )
}

/** Source-level tier marker for the closed adjustable-separator primitive. */
export const meta = { shape: "leaf", world: "pure" } as const
