"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"
import { Rail } from "@starci/grammar/core"
import { collapsibleRailMotionClassName } from "./classNames"

/** Expanded learn-navigation width, kept equal to the frame's `w-64`. */
const EXPANDED_WIDTH = 256
/** Compact learn-navigation width, kept equal to the frame's `w-16`. */
const COLLAPSED_WIDTH = 64
/** Legacy-proven spring: quick enough to follow the press without snapping the content column. */
const SPRING_TRANSITION = { type: "spring" as const, stiffness: 420, damping: 38 }
/** Reduced-motion keeps the state change while removing its interpolation. */
const INSTANT_TRANSITION = { duration: 0 }

/** The two checked trees rendered through one persistent navigation host. */
export type CollapsibleRailProps = {
    readonly isCollapsed: boolean
    readonly expanded: ReactNode
    readonly collapsed: ReactNode
}

/**
 * Keep the course rail mounted while its geometry changes.
 *
 * Expanded and compact remain separate states because their contents differ. The motion wrapper
 * owns only continuity and width; the nested Tree still opens the real navigation landmark from
 * the selected state. Keeping the wrapper stable lets the routed body reflow beside it, matching
 * the legacy collapse-in-place behavior. Readers requesting reduced motion receive the same state
 * change without interpolation.
 */
export const CollapsibleRail = (props: CollapsibleRailProps) => {
    const { isCollapsed, expanded, collapsed } = props
    const reduceMotion = useReducedMotion()
    return (
        <motion.div
            className={collapsibleRailMotionClassName}
            initial={false}
            animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
            transition={reduceMotion ? INSTANT_TRANSITION : SPRING_TRANSITION}
        >
            <Rail
                collapse={isCollapsed ? "collapsed" : "expanded"}
                height="fill"
                landmark="content-navigation"
                motion={reduceMotion ? "reduced" : "animated"}
                width={isCollapsed ? "compact" : "standard"}
            >
                {isCollapsed
                    ? collapsed
                    : expanded}
            </Rail>
        </motion.div>
    )
}
