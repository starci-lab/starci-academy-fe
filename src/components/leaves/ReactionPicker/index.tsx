"use client"

import { useEffect, useRef, useState } from "react"
import { Button as HeroButton } from "@heroui/react"
import { AnimatePresence, motion } from "framer-motion"
import { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
import {
    getReactionChoiceClassName,
    getReactionImageClassName,
    reactionPickerClassName,
    reactionPickerMenuClassName,
    reactionSummaryClassName,
    reactionTooltipClassName,
} from "./classNames"

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
const ReactionImage = (props: ReactionImageProps) => (
    <img
        src={reactionAsset(props.type)}
        alt=""
        aria-hidden
        draggable={false}
        className={getReactionImageClassName(props.size)}
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
export type ReactionPickerProps = {
    readonly props: ReactionPickerData
    readonly on?: ReactionPickerActions
}

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
export const ReactionPicker = (props: ReactionPickerProps) => {
    const data = props.props
    const on = props.on
    const [isOpen, setIsOpen] = useState(false)
    const rootRef = useRef<HTMLDivElement>(null)
    const selectedLabel = data.selected === null || data.selected === undefined
        ? undefined
        : data.labels[data.selected]

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
        if (data.count <= 0) return null
        return <div className={reactionSummaryClassName}>
            {selectedLabel === undefined || data.selected === null || data.selected === undefined
                ? null
                : <ReactionImage type={data.selected} size="summary" />}
            <span>{data.count}</span>
        </div>
    }

    const select = (type: ReactionType) => {
        on.select?.(data.selected === type ? null : type)
        setIsOpen(false)
    }

    return <div ref={rootRef} className={reactionPickerClassName}>
        <HeroButton
            variant="tertiary"
            size="sm"
            aria-label={data.label}
            aria-expanded={isOpen}
            isDisabled={data.isPending === true}
            onPress={() => setIsOpen((current) => !current)}
        >
            {selectedLabel === undefined || data.selected === null || data.selected === undefined
                ? <span>{data.label}</span>
                : <ReactionImage type={data.selected} size="summary" />}
            {data.count > 0 ? <span>{data.count}</span> : null}
        </HeroButton>
        <AnimatePresence>
            {isOpen ? <motion.div
                variants={PICKER_VARIANTS}
                initial="hidden"
                animate="visible"
                exit="exit"
                style={{ transformOrigin: "bottom left" }}
                className={reactionPickerMenuClassName}
            >
                {REACTION_TYPES.map((type) => <motion.button
                    key={type}
                    type="button"
                    aria-label={data.labels[type]}
                    variants={CHOICE_VARIANTS}
                    whileHover={{ scale: 1.4, y: -4 }}
                    whileTap={{ scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                    onClick={() => select(type)}
                    className={getReactionChoiceClassName(data.selected === type)}
                >
                    <span className={reactionTooltipClassName}>
                        {data.labels[type]}
                    </span>
                    <ReactionImage type={type} size="picker" />
                </motion.button>)}
            </motion.div> : null}
        </AnimatePresence>
    </div>
}
