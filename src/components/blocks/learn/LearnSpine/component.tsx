import { Badge, Sidebar, type SidebarGroup, type SidebarItem, Text } from "@starci/grammar/common"
import { LabelledProgressRow } from "@/components/composites/LabelledProgressRow"
import { PressableSurface } from "@/components/branches/PressableSurface"
import { iconSourceFor, type IconName } from "@/components/leaves/Icon"
import { learnSpineResumeClassName } from "./classNames"

/** One reachable place in the course, and what the rail says about it before you go. */
export type LearnSpineRow = {
    readonly id: string
    readonly label: string
    readonly icon: IconName
    readonly isCurrent?: boolean
    readonly fact?: string
    readonly isLocked?: boolean
}

/** A titled run of rows - the course's own sectioning, carried into the rail. */
export type LearnSpineGroup = { readonly id: string; readonly label: string; readonly rows: ReadonlyArray<LearnSpineRow> }
/** The whole rail as data: where you are, where you left off, and everywhere you may go. */
export type LearnSpineData = {
    readonly lockedLabel: string
    readonly collapseLabel: string
    readonly expandLabel: string
    readonly isCollapsed: boolean
    readonly home: LearnSpineRow
    readonly resume?: { readonly label: string; readonly title: string; readonly percent: number; readonly percentText: string }
    readonly groups: ReadonlyArray<LearnSpineGroup>
}
/** What the rail reports when a learner picks a row, resumes, or narrows the rail. */
export type LearnSpineActions = { readonly openRow?: (id: string) => void; readonly resume?: () => void; readonly toggleCollapse?: () => void }
/** One rail call: its data, its callbacks, and the width and loading state it is asked for. */
export type LearnSpineProps = { readonly props: LearnSpineData; readonly on?: LearnSpineActions; readonly isLoading?: boolean; readonly isCollapsed?: boolean; readonly presentation?: "rail" | "drawer" }
/** The collapsed rail takes the same call as the expanded one; only the projection differs. */
export type LearnSpineCollapsedProps = LearnSpineProps

const sidebarItemOf = (row: LearnSpineRow, lockedLabel: string): SidebarItem => ({
    id: row.id,
    label: row.label,
    source: iconSourceFor(row.icon, "leading"),
    ...(row.isLocked === true ? { trailing: <Badge tone="warning">{lockedLabel}</Badge> } : row.fact === undefined ? {} : { trailing: <Badge tone="accent">{row.fact}</Badge> }),
})

const renderSidebar = (input: LearnSpineProps, collapsed: boolean, presentation: "rail" | "drawer") => {
    const data = input.props
    const groups: ReadonlyArray<SidebarGroup> = [
        { id: "home", items: [sidebarItemOf(data.home, data.lockedLabel)] },
        ...data.groups.map((group) => ({ id: group.id, label: group.label, items: group.rows.map((row) => sidebarItemOf(row, data.lockedLabel)) })),
    ]
    const selectedKey = [data.home, ...data.groups.flatMap((group) => group.rows)].find((row) => row.isCurrent === true)?.id
    const resume = data.resume
    const header = resume === undefined ? undefined : (
        <PressableSurface label={resume.title} press={input.on?.resume} isRaised>
            <div className={learnSpineResumeClassName}>
                <Text size="xs">{resume.label}</Text>
                <LabelledProgressRow props={{ id: "resume", title: resume.title, percent: resume.percent, percentText: resume.percentText }} isLoading={input.isLoading} />
            </div>
        </PressableSurface>
    )

    return <Sidebar
        label={data.home.label}
        groups={groups}
        selectedKey={selectedKey}
        presentation={presentation}
        isCollapsed={collapsed}
        collapseLabel={data.collapseLabel}
        expandLabel={data.expandLabel}
        toggleSource={iconSourceFor("collapseRail", "leading")}
        header={header}
        onAction={input.on?.openRow}
        onCollapsedChange={() => input.on?.toggleCollapse?.()}
    />
}

/** Expanded course-specific data projected through the shared Sidebar renderer. */
export const learnSpine = (props: LearnSpineProps) => renderSidebar(props, false, props.presentation === "drawer" ? "drawer" : "rail")
/** Collapsed projection of the same course-specific data. */
export const learnSpineCollapsed = (props: LearnSpineProps) => renderSidebar(props, true, "rail")
/** The same data projected for the compact drawer, which is never collapsed. */
export const learnSpineDrawer = (props: LearnSpineProps) => renderSidebar(props, false, "drawer")

/** Product route adapter; Grammar owns every sidebar DOM and geometry decision. */
export const LearnSpineBase = (props: LearnSpineProps) => props.presentation === "drawer"
    ? learnSpineDrawer(props)
    : renderSidebar(props, props.isCollapsed ?? props.props.isCollapsed, "rail")

/** Route adapter for the narrow rail; the caller has already decided it should be narrow. */
export const LearnSpineCollapsedBase = (props: LearnSpineCollapsedProps) => learnSpineCollapsed(props)
