"use client"

import { useEffect, useRef, useState } from "react"
import { Button as HeroButton, cn } from "@heroui/react"
import { AnimatePresence, motion } from "framer-motion"
import type { LeafProps } from "@/components/contracts/props"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"

/** Localized copy for the fixed StarCi reaction vocabulary. */
export type ReactionLabels = Readonly<Record<ReactionType, string>>

/** Product order inherited from the legacy StarCi reaction picker. */
const REACTION_TYPES = [
    ReactionType.Like,
    ReactionType.Love,
    ReactionType.Haha,
    ReactionType.Wow,
    ReactionType.Sad,
    ReactionType.Angry,
] as const satisfies ReadonlyArray<ReactionType>

/** Exact checked-in Fluent Emoji asset for one product reaction. */
const reactionAsset = (type: ReactionType) => `/reactions/${type}.svg`

/** Internal placement owned by the reaction leaf. */
type ReactionImageProps = {
    readonly type: ReactionType
    readonly size: "summary" | "picker"
}

/** Draw one reaction asset at the optical size owned by its placement. */
const ReactionImage = ({ type, size }: ReactionImageProps) => (
    <img
        src={reactionAsset(type)}
        alt=""
        aria-hidden
        draggable={false}
        className={cn("inline-block shrink-0 select-none", size === "picker" ? "size-7" : "size-4")}
    />
)

/** Settled reaction state for one activity. */
export type ReactionPickerData = {
    readonly label: string
    readonly count: number
    readonly selected?: ReactionType | null
    readonly labels: ReactionLabels
    readonly isPending?: boolean
}

/** A selected reaction, or `null` when the current reaction is removed. */
export type ReactionPickerActions = { readonly select?: (type: ReactionType | null) => void }
/** Props for the intrinsic six-reaction control. */
export type ReactionPickerProps = LeafProps<ReactionPickerData, ReactionPickerActions>

const PICKER_VARIANTS = {
    hidden: { opacity: 0, y: 8, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 500, damping: 30, staggerChildren: 0.03 } },
    exit: { opacity: 0, y: 8, scale: 0.8, transition: { duration: 0.12 } },
} as const
const CHOICE_VARIANTS = {
    hidden: { opacity: 0, y: 6, scale: 0.5 },
    visible: { opacity: 1, y: 0, scale: 1 },
} as const

/** Legacy-faithful controlled reaction trigger and six-choice picker. */
export const ReactionPicker = ({ props, on }: ReactionPickerProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const selectedLabel = props.selected === null || props.selected === undefined
        ? undefined
        : props.labels[props.selected]

    useEffect(() => {
        if (!isOpen) return
        const closeOutside = (event: PointerEvent) => {
            if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) setIsOpen(false)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsOpen(false)
        }
        document.addEventListener("pointerdown", closeOutside)
        document.addEventListener("keydown", closeOnEscape)
        return () => {
            document.removeEventListener("pointerdown", closeOutside)
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [isOpen])

    if (on?.select === undefined) {
        if (props.count <= 0) return null
        return <div data-tier="leaf" data-component="ReactionPicker" className="flex items-center gap-1 text-xs text-muted">
            {selectedLabel === undefined || props.selected === null || props.selected === undefined
                ? null
                : <ReactionImage type={props.selected} size="summary" />}
            <span>{props.count}</span>
        </div>
    }

    const select = (type: ReactionType) => {
        on.select?.(props.selected === type ? null : type)
        setIsOpen(false)
    }

    return <div ref={rootRef} data-tier="leaf" data-component="ReactionPicker" className="relative flex items-center">
        <HeroButton
            variant="tertiary"
            size="sm"
            aria-label={props.label}
            aria-expanded={isOpen}
            isDisabled={props.isPending === true}
            onPress={() => setIsOpen((current) => !current)}
        >
            {selectedLabel === undefined || props.selected === null || props.selected === undefined
                ? <span>{props.label}</span>
                : <ReactionImage type={props.selected} size="summary" />}
            {props.count > 0 ? <span>{props.count}</span> : null}
        </HeroButton>
        <AnimatePresence>
            {isOpen ? <motion.div
                variants={PICKER_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ transformOrigin: "bottom left" }}
                className="absolute bottom-full left-0 z-10 mb-1 flex items-center gap-1 rounded-full bg-surface p-1 ring-1 ring-separator"
            >
                {REACTION_TYPES.map((type) => <motion.button
                    key={type}
                    type="button"
                    aria-label={props.labels[type]}
                    variants={CHOICE_VARIANTS}
                    whileHover={{ scale: 1.4, y: -4 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    onClick={() => select(type)}
                    className={cn(
                        "group/reaction relative flex items-center justify-center rounded-full p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                        props.selected === type && "bg-accent-soft",
                    )}
                >
                    <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2 text-[10px] font-medium text-background opacity-0 transition-opacity group-hover/reaction:opacity-100">
                        {props.labels[type]}
                    </span>
                    <ReactionImage type={type} size="picker" />
                </motion.button>)}
            </motion.div> : null}
        </AnimatePresence>
    </div>
}

/** Source-level tier marker for the intrinsic reaction control. */
export const meta = { shape: "leaf", world: "pure" } as const
