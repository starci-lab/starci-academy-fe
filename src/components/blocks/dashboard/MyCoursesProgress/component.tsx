import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Tree } from "@/components/branches/Tree"
import { LabelledProgressRow, type LabelledProgressRowData } from "@/components/leaves/LabelledProgressRow"
import { EmptyNotice } from "@/components/leaves/EmptyNotice"

/**
 * BLOCK - `MyCoursesProgress`, presentational half.
 *
 * THE STATE PICKS THE TREE. `empty` and `failed` draw a notice with a way out; `pending` and
 * `ready` draw the same list, one of them resting. A situation that did not change the tree would
 * be props.
 *
 * THE LIST IS A LEAF'S BUSINESS, not the registry's. `LabelledProgressRow` keeps its own count and
 * its own keys; the contract here supplies only the seam between rows.
 */

/** How many resting rows are drawn, so the resting card has the height of a real one. */
const RESTING_ROWS: ReadonlyArray<LabelledProgressRowData> = [
    { id: "resting-0" },
    { id: "resting-1" },
    { id: "resting-2" },
]

/** What the card carries in EVERY state. */
export type MyCoursesFrame = {
    /** The already-resolved name of the region. */
    readonly label: string
}

/** Props for {@link _MyCoursesProgress}, discriminated by the situation. */
export type MyCoursesProgressProps =
    | { readonly state: "pending"; readonly props: MyCoursesFrame }
    | { readonly state: "empty"; readonly props: MyCoursesFrame & { readonly message: string; readonly retryLabel: string } }
    | { readonly state: "failed"; readonly props: MyCoursesFrame & { readonly message: string; readonly retryLabel: string } }
    | {
        readonly state: "ready"
        readonly props: MyCoursesFrame & {
            readonly count: string
            readonly rows: ReadonlyArray<LabelledProgressRowData>
        }
    }

/** What the block reports. */
export type MyCoursesProgressActions = {
    /** Called when the reader asks for the list again. */
    readonly retry?: () => void
}

/**
 * Render the list.
 *
 * @param input - {@link MyCoursesProgressProps}
 */
export const _MyCoursesProgress = (input: MyCoursesProgressProps & { readonly on?: MyCoursesProgressActions }) => {
    if (input.state === "empty" || input.state === "failed") {
        return (
            <SurfaceCard props={{ label: input.props.label }}>
                <EmptyNotice
                    props={{ icon: "course", message: input.props.message, actionLabel: input.props.retryLabel }}
                    on={{ act: input.on?.retry }}
                />
            </SurfaceCard>
        )
    }
    const isLoading = input.state === "pending"
    const rows = input.state === "ready" ? input.props.rows : RESTING_ROWS
    return (
        <SurfaceCard
            props={{ label: input.props.label, fact: input.state === "ready" ? input.props.count : undefined }}
            isLoading={isLoading}
        >
            <Tree contract="stacked-sections">
                {rows.map((row) => (
                    <LabelledProgressRow key={row.id} props={row} isLoading={isLoading} />
                ))}
            </Tree>
        </SurfaceCard>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { world: "pure", domain: "courses" } as const
