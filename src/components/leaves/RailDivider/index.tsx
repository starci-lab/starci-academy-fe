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

// The separator owns no layout width. Its interaction strip overlaps both neighbours so the
// visible rule stays on their shared edge instead of opening a false gutter between rail and body.
const DIVIDER_CLASSES = "group relative hidden w-0 shrink-0 cursor-col-resize self-stretch outline-none before:absolute before:left-0 before:top-0 before:h-full before:w-px before:rounded-full before:bg-separator before:transition-colors after:absolute after:-left-1 after:top-0 after:h-full after:w-2 after:content-[''] hover:before:bg-accent focus-visible:before:bg-accent md:sticky md:top-16 md:block md:h-app-rail"

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
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
        event.preventDefault()
        const step = event.shiftKey ? 32 : 16
        applyWidth(widthRef.current + (event.key === "ArrowLeft" ? -step : step))
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
        />
    )
}

/** Source-level tier marker for the closed adjustable-separator primitive. */
export const meta = { shape: "leaf", world: "pure" } as const
