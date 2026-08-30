"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/leaves/Badge"
import { StarCiAiTeacher } from "@/components/leaves/StarCiAiTeacher"
import { Text } from "@/components/leaves/Text"
import { starCiAiDragBoundaryClassName, starCiAiFabClassName, starCiAiLabelClassName } from "./classNames"

/** Closed semantic data for the one global AI trigger. */
export type StarCiAiFabData = {
    readonly label: string
    readonly isOpen: boolean
    readonly hasUnread?: boolean
}

/** The one action emitted by the persistent StarCi AI entry. */
export type StarCiAiFabActions = {
    readonly press?: () => void
}

/** Props for the product-branded global AI trigger. */
export type StarCiAiFabProps = {
    readonly props: StarCiAiFabData
    readonly on?: StarCiAiFabActions
    readonly isLoading?: boolean
}

/** Draw the purpose-named StarCi AI mascot as one draggable, keyboard-operable trigger. */
export const StarCiAiFab = (props: StarCiAiFabProps) => {
    const boundaryRef = useRef<HTMLDivElement>(null)
    const didDragRef = useRef(false)
    const reduceMotion = useReducedMotion()
    const [dragFrame, setDragFrame] = useState(0)

    useEffect(() => {
        const restoreSafeOrigin = () => setDragFrame((value) => value + 1)
        window.addEventListener("resize", restoreSafeOrigin)
        window.visualViewport?.addEventListener("resize", restoreSafeOrigin)
        return () => {
            window.removeEventListener("resize", restoreSafeOrigin)
            window.visualViewport?.removeEventListener("resize", restoreSafeOrigin)
        }
    }, [])

    return (
        <div ref={boundaryRef} className={starCiAiDragBoundaryClassName} data-slot="starci-ai-drag-boundary">
            <motion.button
                key={dragFrame}
                type="button"
                aria-label={props.props.label}
                aria-expanded={props.props.isOpen}
                data-slot="starci-ai-mascot"
                data-drag-frame={dragFrame}
                data-unread={props.props.hasUnread === true ? "true" : "false"}
                className={starCiAiFabClassName}
                drag
                dragConstraints={boundaryRef}
                dragElastic={0}
                dragMomentum={false}
                whileDrag={reduceMotion ? undefined : { scale: 1.06 }}
                whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                onDragStart={() => { didDragRef.current = true }}
                onDragEnd={() => { setTimeout(() => { didDragRef.current = false }, 0) }}
                onClick={() => {
                    if (didDragRef.current) return
                    props.on?.press?.()
                }}
            >
                <StarCiAiTeacher props={{ size: "md", isOnline: true }} isLoading={props.isLoading} />
                <span className={starCiAiLabelClassName} aria-hidden="true">
                    <Text props={{ content: props.props.label, size: "sm", weight: "semibold" }} isLoading={props.isLoading} />
                </span>
                {props.props.hasUnread === true ? <Badge props={{ content: "1", tone: "accent" }} /> : null}
            </motion.button>
        </div>
    )
}
