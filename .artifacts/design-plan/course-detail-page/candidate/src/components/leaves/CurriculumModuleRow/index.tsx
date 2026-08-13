import { Badge } from "@/components/leaves/Badge"
import { Icon } from "@/components/leaves/Icon"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `CurriculumModuleRow`: one course module, folded until asked for.
 *
 * Target path: `src/components/leaves/CurriculumModuleRow/index.tsx`.
 *
 * A PREVIEW-LEVEL TIER DECISION, recorded rather than done quietly — and the same one the sibling
 * catalog candidate reached independently for its own disclosure. The Plan spoke of a curriculum
 * "accordion". A contract entry draws one `div` and its classes, so it cannot produce a
 * `details`/`summary` pair, and the target has no accordion branch at any tier. HeroUI 3.2.1 ships
 * none either — there is no `Accordion`, `Collapsible` or `Disclosure` export in
 * `@heroui/react`, which was checked before this file was written. So the disclosure is owned at
 * the tier that already owns intrinsic controls: the leaf.
 *
 * IT IS A NATIVE DISCLOSURE. `details` is keyboard-operable, announced as expandable, and its
 * contents are findable by the browser's own find-in-page once open. A div with a click handler
 * gets none of that for free, and a 23-module curriculum is exactly the place a reader uses find.
 *
 * THE CLOSED ROW IS THE PRODUCTION ROW. Title, level badge and preview count sit on one line
 * exactly as the named render shows them; opening adds the lessons beneath without moving them.
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

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type CurriculumModuleRowData = {
    /** The already-resolved module title. */
    readonly title: string
    /** The already-resolved level word the production render shows beside the title. */
    readonly levelLabel?: string
    /** The already-resolved preview count sentence. */
    readonly previewLabel?: string
    /** The lessons revealed on open. An empty run makes the row non-disclosing. */
    readonly lessons?: ReadonlyArray<CurriculumLesson>
    /** Whether this module starts open. */
    readonly isOpen?: boolean
}

/** Props for {@link CurriculumModuleRow}. Three fixed slots, no fourth. */
export type CurriculumModuleRowProps = LeafProps<CurriculumModuleRowData>

const SUMMARY_CLASSES = "flex cursor-pointer list-none flex-row items-center gap-3 marker:content-none"

/**
 * Draw one curriculum module, disclosing its lessons when it has any.
 *
 * @param input - {@link CurriculumModuleRowProps}
 */
export const CurriculumModuleRow = ({ props, isLoading = false }: CurriculumModuleRowProps) => {
    const lessons = props.lessons ?? []
    // A module with nothing inside it must not invite a press that opens onto nothing: that reads
    // as a broken control rather than an empty one. It renders as a plain row instead.
    const canDisclose = lessons.length > 0 && !isLoading
    const head = (
        <>
            {canDisclose ? (
                <span className="shrink-0 text-muted transition-transform group-open:rotate-180">
                    <Icon props={{ name: "disclosure", role: "chip" }} />
                </span>
            ) : null}
            <span className="min-w-0 grow text-sm leading-5 text-foreground">{props.title}</span>
            {props.levelLabel === undefined ? null : (
                // The locked Badge leaf already owns this shape and its success tone. Hand-writing
                // a pill here would have made this file a second owner of the product's chip.
                <span className="shrink-0">
                    <Badge props={{ content: props.levelLabel, tone: "success" }} isLoading={isLoading} />
                </span>
            )}
            {props.previewLabel === undefined ? null : (
                <span className="shrink-0 text-xs leading-4 text-muted">{props.previewLabel}</span>
            )}
        </>
    )

    if (!canDisclose) {
        return (
            <div
                data-tier="leaf"
                data-component="CurriculumModuleRow"
                data-disclosing="false"
                data-loading={isLoading ? "true" : "false"}
                className="flex flex-row items-center gap-3"
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
            open={props.isOpen ?? false}
            className="group"
        >
            <summary className={SUMMARY_CLASSES}>{head}</summary>
            <ul className="mt-3 flex flex-col gap-2 pl-7">
                {lessons.map((lesson) => (
                    <li key={lesson.id} className="flex flex-row items-center gap-2">
                        <span className="min-w-0 grow text-xs leading-4 text-muted">{lesson.title}</span>
                        {lesson.isPreview === true ? (
                            <span className="shrink-0 text-xs leading-4 text-accent-soft-foreground">
                                <Icon props={{ name: "review", role: "chip" }} />
                            </span>
                        ) : null}
                    </li>
                ))}
            </ul>
        </details>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
