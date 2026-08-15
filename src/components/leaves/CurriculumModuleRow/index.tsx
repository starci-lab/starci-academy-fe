"use client"

import { useState } from "react"
import { Badge } from "@/components/leaves/Badge"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `CurriculumModuleRow`: one course module, folded until asked for.
 *
 * Target path: `src/components/leaves/CurriculumModuleRow/index.tsx`.
 *
 * WHY A LEAF AND NOT A CONTRACT. `ContractHost` does not admit `details`, and it should not: a
 * disclosure is an intrinsic CONTROL with its own open state, not a shape that holds other shapes.
 * There is also no accordion branch in this repository, and HeroUI 3.2.1 ships no Accordion,
 * Collapsible or Disclosure - checked before this file was written rather than assumed. So the
 * control belongs to the tier that already owns intrinsic controls.
 *
 * IT IS A NATIVE DISCLOSURE. `details` is keyboard-operable, announced as expandable, and its
 * contents are findable by the browser's own find-in-page once open. A div with a click handler
 * gets none of that, and a twenty-three module curriculum is exactly where a reader uses find.
 *
 * THE CLOSED ROW IS THE PRODUCTION ROW. Title, level badge and preview count sit on one line as the
 * named render shows them; opening adds the lessons beneath without moving any of them.
 *
 * A MODULE WITH NO LESSONS DOES NOT DISCLOSE. An empty disclosure invites a press that opens onto
 * nothing, which reads as a broken control rather than an empty one, so that row renders flat.
 */

/** One lesson inside a module. */
export type CurriculumLesson = {
    /** Stable identity within the module. */
    readonly id: string
    /** The already-resolved lesson title. */
    readonly title: string
    /** Whether this lesson is previewable before enrolment. */
    readonly isPreview?: boolean
}

/** Stable module difficulty identity; labels stay localized at the connected owner. */
export type CurriculumLevel = "foundation" | "intermediate" | "advanced"

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type CurriculumModuleRowData = {
    /** The already-resolved module title. */
    readonly title: string
    /** Stable difficulty identity used to select a semantic badge tone. */
    readonly level?: CurriculumLevel
    /** The already-resolved level word the production render shows beside the title. */
    readonly levelLabel?: string
    /** The already-resolved preview count sentence. */
    readonly previewLabel?: string
    /** The lessons revealed on open. An empty run makes the row non-disclosing. */
    readonly lessons?: ReadonlyArray<CurriculumLesson>
    /** Whether this module starts open. */
    readonly isOpen?: boolean
}

/** Navigation emitted by a flat module row or one lesson inside its disclosure. */
export type CurriculumModuleRowActions = {
    readonly press?: () => void
    readonly pressLesson?: (id: string) => void
}

/** Props for {@link CurriculumModuleRow}. Three fixed slots, no fourth. */
export type CurriculumModuleRowProps = LeafProps<CurriculumModuleRowData, CurriculumModuleRowActions>

const SUMMARY_CLASSES = "flex cursor-pointer list-none flex-row items-center gap-3 marker:content-none"
const ROW_CLASSES = "flex flex-row items-center gap-3"

/**
 * The trailing meta shares ONE WRAPPING line rather than holding its width.
 *
 * The named render does the same, and the reason shows up only at 375px: level and preview count are
 * `shrink-0`, so with the title free to wrap they took the width and left it about 130px - a
 * sixty-character module name broke over five lines and the row grew taller than the card. The
 * baseline answers that by letting the meta wrap under the title and truncating the title to one
 * line, so every row stays the same height and the list is still scannable.
 */
const META_CLASSES = "flex shrink-0 flex-row flex-wrap items-center justify-start gap-2"

/**
 * The title TRUNCATES rather than wrapping, which is the baseline's behaviour and not a shortcut.
 *
 * A curriculum is read by scanning down it for the module you want, and a scan needs a stable row
 * height far more than it needs the tail of a long name - which the disclosure reveals in full the
 * moment it is opened.
 */
const TITLE_CLASSES = "block min-w-0 grow truncate text-sm font-medium leading-5 text-foreground"

/** Difficulty is the meaning; the Badge leaf remains the sole owner of actual palette tokens. */
const LEVEL_TONES = {
    foundation: "success",
    intermediate: "warning",
    advanced: "danger",
} as const

/**
 * Draw one curriculum module, disclosing its lessons when it has any.
 *
 * @param input - {@link CurriculumModuleRowProps}
 */
export const CurriculumModuleRow = (input: CurriculumModuleRowProps) => {
    const [isOpen, setIsOpen] = useState(input.props.isOpen ?? false)
    const lessons = input.props.lessons ?? []
    const isLoading = input.isLoading ?? false
    const canDisclose = lessons.length > 0 && !isLoading
    const head = (
        <>
            {canDisclose ? (
                <span
                    data-curriculum-chevron
                    className={`shrink-0 text-foreground transition-transform ${isOpen ? "rotate-90" : "rotate-0"}`}
                >
                    <Icon props={{ name: "disclosure", role: "chip" }} />
                </span>
            ) : null}
            <span className={TITLE_CLASSES}>{input.props.title}</span>
            {input.props.levelLabel === undefined && input.props.previewLabel === undefined ? null : (
                <span className={META_CLASSES}>
                    {input.props.levelLabel === undefined ? null : (
                        <Badge
                            props={{
                                content: input.props.levelLabel,
                                tone: input.props.level === undefined ? "neutral" : LEVEL_TONES[input.props.level],
                            }}
                            isLoading={isLoading}
                        />
                    )}
                    {input.props.previewLabel === undefined ? null : (
                        <span className="text-xs leading-4 text-muted">{input.props.previewLabel}</span>
                    )}
                </span>
            )}
        </>
    )

    if (!canDisclose) {
        if (input.on?.press !== undefined) {
            return (
                <button
                    type="button"
                    data-tier="leaf"
                    data-component="CurriculumModuleRow"
                    data-disclosing="false"
                    data-loading={isLoading ? "true" : "false"}
                    className={`${ROW_CLASSES} w-full text-left`}
                    disabled={isLoading}
                    onClick={input.on.press}
                >
                    {head}
                </button>
            )
        }
        return (
            <div
                data-tier="leaf"
                data-component="CurriculumModuleRow"
                data-disclosing="false"
                data-loading={isLoading ? "true" : "false"}
                className={ROW_CLASSES}
            >
                {head}
            </div>
        )
    }

    return (
        <details
            data-tier="leaf"
            data-component="CurriculumModuleRow"
            data-disclosing="true"
            data-lessons={lessons.length}
            open={isOpen}
            onToggle={(event) => setIsOpen(event.currentTarget.open)}
            className="group"
        >
            <summary className={SUMMARY_CLASSES}>{head}</summary>
            <div className="mt-3 divide-y divide-separator pl-12">
                {lessons.map((lesson) => (
                    <div key={lesson.id} className="py-2 pl-1 text-sm leading-5 text-foreground marker:text-muted">
                        {input.on?.pressLesson === undefined ? (
                            <span>{lesson.title}</span>
                        ) : (
                            <button
                                type="button"
                                className="text-left hover:text-accent-soft-foreground"
                                onClick={() => input.on?.pressLesson?.(lesson.id)}
                            >
                                {lesson.title}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </details>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
