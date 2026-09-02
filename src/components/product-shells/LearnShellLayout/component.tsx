import { Subnav, Tabs, WorkspaceShell } from "@starci/grammar/common"
import type { ReactNode } from "react"
import { DrawerBranch } from "@/components/branches/DrawerBranch"
import { LearnSpine } from "@/components/blocks/learn/LearnSpine"
import { Icon, iconSourceFor, type IconName } from "@/components/leaves/Icon"

/** One product-owned mobile view projected through Grammar Tabs. */
export interface LearnMobileTab {
    readonly id: string
    readonly label: string
    readonly icon: IconName
    readonly isCurrent?: boolean
}

/** The set of panes compact learn can show one at a time, since it has no room for two. */
export type LearnMobileView = "today" | "course" | "progress" | "contents" | "lesson" | "outline"

/** Everything the learn shell renders from: its copy, its compact affordances, and its bleed. */
export type LearnShellLayoutData = {
    readonly navigationLabel: string
    readonly mobileTabs?: ReadonlyArray<LearnMobileTab>
    readonly mobileCourseNavigation?: { readonly label: string; readonly closeLabel: string; readonly courseTitle: string; readonly isOpen: boolean }
    readonly isFullBleed: boolean
}

/** The navigation moves the shell reports upward; the product, not the shell, owns the state. */
export type LearnShellLayoutActions = {
    readonly openMobileTab?: (id: string) => void
    readonly openCourseNavigation?: () => void
    readonly closeCourseNavigation?: () => void
    readonly setRailCollapsed?: (collapsed: boolean) => void
}

/** The full call: what to render, which lesson surface sits inside it, and where to report back. */
export type LearnShellLayoutProps = LearnShellLayoutData & {
    readonly displayId: string
    readonly isRailCollapsed?: boolean
    readonly on?: LearnShellLayoutActions
    readonly surface: ReactNode
}

/** Product-connected learn owner; Grammar owns all workspace, navigation and compact geometry. */
export const LearnShellLayoutBase = (props: LearnShellLayoutProps) => {
    const tabs = props.mobileTabs ?? []
    const selectedTab = tabs.find((tab) => tab.isCurrent)?.id ?? tabs[0]?.id
    const compactHeader = props.mobileCourseNavigation === undefined ? undefined : (
        <Subnav
            label={props.mobileCourseNavigation.label}
            title={props.mobileCourseNavigation.courseTitle}
            leading={<Icon source={iconSourceFor("course", "leading")} usage="leading" />}
            menuIcon={<Icon source={iconSourceFor("menu", "leading")} usage="leading" />}
            openMenuLabel={props.mobileCourseNavigation.label}
            closeMenuLabel={props.mobileCourseNavigation.closeLabel}
            isMenuOpen={props.mobileCourseNavigation.isOpen}
            onMenuOpenChange={(isOpen) => isOpen ? props.on?.openCourseNavigation?.() : props.on?.closeCourseNavigation?.()}
        />
    )
    const compactNavigation = selectedTab === undefined ? undefined : (
        <Tabs
            label={props.navigationLabel}
            selectedKey={selectedTab}
            items={tabs.map((tab) => ({ id: tab.id, label: tab.label, leading: <Icon source={iconSourceFor(tab.icon, "leading")} usage="leading" /> }))}
            labelVisibility="always"
            onSelect={props.on?.openMobileTab}
        />
    )
    const drawer = props.mobileCourseNavigation === undefined ? undefined : (
        <DrawerBranch
            isOpen={props.mobileCourseNavigation.isOpen}
            placement="left"
            title={props.mobileCourseNavigation.courseTitle}
            onDismiss={() => props.on?.closeCourseNavigation?.()}
        >
            <LearnSpine displayId={props.displayId} presentation="drawer" onNavigate={props.on?.closeCourseNavigation} />
        </DrawerBranch>
    )

    if (props.isFullBleed) return <WorkspaceShell mainLandmark="caller" primary={props.surface} />

    const workspaceProps = {
        mainLandmark: "caller" as const,
        navigation: <LearnSpine displayId={props.displayId} isCollapsed={props.isRailCollapsed} onCollapsedChange={props.on?.setRailCollapsed} />,
        navigationLabel: props.navigationLabel,
        navigationTrack: "intrinsic" as const,
        navigationVisibility: "wide" as const,
        primary: props.surface,
        align: "stretch" as const,
        ...(compactHeader === undefined ? {} : { compactHeader }),
        ...(drawer === undefined ? {} : { floatingLayer: drawer }),
    }

    return compactNavigation === undefined
        ? <WorkspaceShell {...workspaceProps} />
        : <WorkspaceShell {...workspaceProps} compactNavigation={compactNavigation} compactNavigationLabel={props.navigationLabel} />
}
