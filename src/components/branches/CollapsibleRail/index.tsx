"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Tree } from "@/components/branches/Tree"
import type { ContractComponent } from "@/components/contracts/props"
import { STARCI_ACADEMY_GRAMMAR_CONTRACTS } from "@/components/contracts/grammar"

/** Expanded learn-navigation width, kept equal to the frame contract's `w-64`. */
const EXPANDED_WIDTH = 256
/** Compact learn-navigation width, kept equal to the frame contract's `w-16`. */
const COLLAPSED_WIDTH = 64
/** Legacy-proven spring: quick enough to follow the press without snapping the content column. */
const SPRING_TRANSITION = { type: "spring" as const, stiffness: 420, damping: 38 }
/** Reduced-motion keeps the state change while removing its interpolation. */
const INSTANT_TRANSITION = { duration: 0 }

/** The two checked trees rendered through one persistent navigation host. */
export type CollapsibleRailProps = {
    readonly isCollapsed: boolean
    readonly expanded: ContractComponent<"learn-course-navigation-rail">
    readonly collapsed: ContractComponent<"learn-course-navigation-rail-collapsed">
}

/**
 * Keep the course rail mounted while its geometry changes.
 *
 * Expanded and compact remain separate contracts because their contents differ. The motion wrapper
 * owns only continuity and width; the nested Tree still opens the real navigation landmark from
 * the selected contract. Keeping the wrapper stable lets the routed body reflow beside it, matching
 * the legacy collapse-in-place behavior. Readers requesting reduced motion receive the same state
 * change without interpolation.
 */
export const CollapsibleRail = ({ isCollapsed, expanded, collapsed }: CollapsibleRailProps) => {
    const reduceMotion = useReducedMotion()
    return (
        <motion.div
            data-tier="branch"
            data-component="CollapsibleRail"
            data-grammar-contract={STARCI_ACADEMY_GRAMMAR_CONTRACTS.rail.key}
            initial={false}
            animate={{ width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
            transition={reduceMotion ? INSTANT_TRANSITION : SPRING_TRANSITION}
        >
            {isCollapsed
                ? <Tree contract="learn-course-navigation-rail-collapsed" render={collapsed} />
                : <Tree contract="learn-course-navigation-rail" render={expanded} />}
        </motion.div>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "branch", world: "pure" } as const
