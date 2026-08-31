import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ChangelogEntryRow } from "@/components/composites/ChangelogEntryRow"
import { changelogListClassName, changelogSurfaceClassName } from "./classNames"

/** Supported changelog categories. */
export type ChangelogCategory = "feature" | "fix" | "announcement"
/** One resolved product update. */
export type ChangelogEntry = { readonly id: string; readonly dateLabel: string; readonly category?: ChangelogCategory; readonly categoryLabel?: string; readonly title: string; readonly body?: string; readonly isAction?: boolean }
/** Changelog section copy and entries. */
export type ChangelogListData = { readonly label: string; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel?: string; readonly entries?: ReadonlyArray<ChangelogEntry> }
/** Changelog navigation actions. */
export type ChangelogListActions = { readonly open?: (id: string) => void; readonly retry?: () => void }
/** State, data and actions accepted by the changelog block. */
export type ChangelogListProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: ChangelogListData; readonly on?: ChangelogListActions }

const categoryTone = (category: ChangelogCategory | undefined) => category === "feature" ? "success" as const : category === "fix" ? "warning" as const : category === "announcement" ? "accent" as const : undefined

/** Draw the product changelog as a semantic joined history. */
export const ChangelogListBase = (props: ChangelogListProps) => {
    if (props.state === "empty" || props.state === "failed") {
        return (
            <SurfaceCard props={{ label: props.props.label }}>
                <EmptyNotice
                    props={{
                        icon: "notification",
                        message: props.state === "empty" ? props.props.emptyMessage : props.props.errorMessage,
                        actionLabel: props.state === "failed" ? props.props.retryLabel : undefined,
                    }}
                    on={{ act: props.state === "failed" ? props.on?.retry : undefined }}
                />
            </SurfaceCard>
        )
    }

    const loading = props.state === "pending"
    const entries: ReadonlyArray<ChangelogEntry> = loading
        ? Array.from({ length: 4 }, (_, index) => ({ id: `resting-${index}`, dateLabel: "", title: "", body: "" }))
        : props.props.entries ?? []

    return (
        <div className={changelogSurfaceClassName}>
            <SurfaceCard props={{ label: props.props.label }} isLoading={loading}>
                <ul className={changelogListClassName}>
                    {entries.map((entry) => (
                        <li key={entry.id}>
                            <ChangelogEntryRow
                                props={{ ...entry, categoryTone: categoryTone(entry.category) }}
                                on={{ open: props.on?.open === undefined ? undefined : () => props.on?.open?.(entry.id) }}
                                isLoading={loading}
                            />
                        </li>
                    ))}
                </ul>
            </SurfaceCard>
        </div>
    )
}
