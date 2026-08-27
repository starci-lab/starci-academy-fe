"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import { railDividerClassName, railDividerHandleClassName } from "./classNames"

/** Width policy and accessible identity for one adjustable rail separator. */
export type RailDividerData = {
    readonly label: string
    readonly storageKey: string
    readonly defaultWidth: number
    readonly minWidth: number
    readonly maxWidth: number
}

/** Closed props for the pointer- and keyboard-adjustable separator. */
export type RailDividerProps = { readonly props: RailDividerData; readonly isLoading?: boolean }

// The separator is a real eight-pixel rail rather than an invisible zero-width hit target. That
// keeps the adjustable boundary discoverable while the hairline still sits on the shared edge.

/** Draw one separator that publishes its rail width to the containing frame. */
export const RailDivider = (props: RailDividerProps) => {
    const dividerRef = useRef<HTMLDivElement>(null)
    const widthRef = useRef(props.props.defaultWidth)
    const dragRef = useRef<{ readonly startX: number, readonly startWidth: number } | null>(null)
    const [width, setWidth] = useState(props.props.defaultWidth)

    const clamp = useCallback(
        (value: number) => Math.min(Math.max(value, props.props.minWidth), props.props.maxWidth),
        [props.props.maxWidth, props.props.minWidth],
    )

    const applyWidth = useCallback((value: number) => {
        const next = clamp(value)
        widthRef.current = next
        setWidth(next)
        const rail = dividerRef.current?.previousElementSibling
        if (rail instanceof HTMLElement) rail.style.width = `${next}px`
    }, [clamp])

    useEffect(() => {
        const stored = window.localStorage.getItem(props.props.storageKey)
        const parsed = stored === null ? props.props.defaultWidth : Number(stored)
        applyWidth(Number.isFinite(parsed) ? parsed : props.props.defaultWidth)
        return () => {
            const rail = dividerRef.current?.previousElementSibling
            if (rail instanceof HTMLElement) rail.style.removeProperty("width")
        }
    }, [applyWidth, props.props.defaultWidth, props.props.storageKey])

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
        window.localStorage.setItem(props.props.storageKey, String(Math.round(widthRef.current)))
    }

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return
        event.preventDefault()
        const step = event.shiftKey ? 32 : 16
        const next = event.key === "Home"
            ? props.props.minWidth
            : event.key === "End"
                ? props.props.maxWidth
                : widthRef.current + (event.key === "ArrowLeft" ? -step : step)
        applyWidth(next)
        window.localStorage.setItem(props.props.storageKey, String(Math.round(widthRef.current)))
    }

    return (
        <div
            ref={dividerRef}
            role="separator"
            aria-orientation="vertical"
            aria-label={props.props.label}
            aria-valuemin={props.props.minWidth}
            aria-valuemax={props.props.maxWidth}
            aria-valuenow={Math.round(width)}
            tabIndex={0}
            className={railDividerClassName}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
        >
            <span aria-hidden="true" className={railDividerHandleClassName} />
        </div>
    )
}
