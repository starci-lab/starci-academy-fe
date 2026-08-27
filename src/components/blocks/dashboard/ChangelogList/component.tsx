import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { ChangelogEntryRow } from "@/components/composites/ChangelogEntryRow"

/** Supported changelog categories. */
export type ChangelogCategory = "feature" | "fix" | "announcement"
/** One resolved product update. */
export type ChangelogEntry = { readonly id: string; readonly dateLabel: string; readonly category?: ChangelogCategory; readonly categoryLabel?: string; readonly title: string; readonly body?: string; readonly isAction?: boolean }
/** Changelog section copy and entries. */
export type ChangelogListData = { readonly label: string; readonly emptyMessage: string; readonly errorMessage: string; readonly entries?: ReadonlyArray<ChangelogEntry> }
/** Changelog navigation actions. */
export type ChangelogListActions = { readonly open?: (id: string) => void }
/** State, data and actions accepted by the changelog block. */
export type ChangelogListProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: ChangelogListData; readonly on?: ChangelogListActions }

const categoryTone = (category: ChangelogCategory | undefined) => category === "feature" ? "success" as const : category === "fix" ? "warning" as const : category === "announcement" ? "accent" as const : undefined

/** Draw the product changelog as a semantic joined history. */
export const ChangelogListBase = (props: ChangelogListProps) => {
    if (props.state === "empty") return null
    const loading = props.state === "pending"
    const entries: ReadonlyArray<ChangelogEntry> = loading ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, dateLabel: "", title: "", body: "" })) : props.state === "failed" ? [{ id: "failed", dateLabel: "", title: props.props.errorMessage }] : props.props.entries ?? []
    return <SurfaceListCard props={{ label: props.props.label }} isLoading={loading}>{entries.map((entry) => <ChangelogEntryRow key={entry.id} props={{ ...entry, categoryTone: categoryTone(entry.category) }} on={{ open: props.on?.open === undefined ? undefined : () => props.on?.open?.(entry.id) }} isLoading={loading} />)}</SurfaceListCard>
}
