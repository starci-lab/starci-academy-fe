"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { _LearnShellLayout, type LearnMobileTab } from "./component"
import type { LearnSpineGroup } from "@/components/blocks/learn/LearnSpine/component"
import type { ComponentType } from "react"

/**
 * The learn frame, connected.
 *
 * WHAT IT RESOLVES IS NAVIGATION, NOT THE COURSE. Which surface the learner is on comes from the
 * path, and where each row goes is a route this product already has - so the frame needs no query of
 * its own. The two facts a row can carry, a due-card count and a rank, arrive as data the day the
 * surfaces that own them hand them over; drawing them from a query here would make the frame a
 * second owner of somebody else's number.
 *
 * THE ROWS ARE THE REFERENCE PRODUCT'S, in its order and its groups: the path a learner is on, the
 * practice around it, and what lets them track themselves against everybody else. A returning
 * learner navigates by those names.
 */

/** What the route hands the frame. */
export interface LearnShellLayoutProps {
    /** The course being learned, as its display id - every row is a path under it. */
    displayId: string
    /** The routed surface, as a component. `RouteShell` made it out of the framework's children. */
    surface: ComponentType
}

/** One row of the spine, before its label is resolved. */
interface SpineRoute {
    readonly id: string
    readonly icon: LearnSpineGroup["rows"][number]["icon"]
    /** The path under the course this row opens. */
    readonly at: string
}

/** The three groups, and the routes inside each. */
const GROUPS: ReadonlyArray<{ id: string, rows: ReadonlyArray<SpineRoute> }> = [
    {
        id: "path",
        rows: [
            { id: "content", icon: "course", at: "/learn/content" },
            { id: "personalProject", icon: "practice", at: "/learn/personal-project" },
        ],
    },
    {
        id: "practice",
        rows: [
            { id: "flashcards", icon: "review", at: "/learn/flashcards" },
            { id: "mockInterview", icon: "talents", at: "/learn/mock-interview" },
            { id: "foundations", icon: "explore", at: "/learn/foundations" },
            { id: "playground", icon: "code", at: "/learn/playground" },
        ],
    },
    {
        id: "track",
        rows: [
            { id: "mindMap", icon: "blog", at: "/learn/mind-map" },
            { id: "leaderboard", icon: "league", at: "/learn/leaderboard" },
            { id: "qa", icon: "community", at: "/learn/qa" },
        ],
    },
]

/** What the bottom bar offers below the rail's breakpoint. */
const TABS: ReadonlyArray<{ id: string, icon: LearnMobileTab["icon"] }> = [
    { id: "course", icon: "course" },
    { id: "contents", icon: "explore" },
    { id: "page", icon: "blog" },
]

/**
 * Draw the learn frame around a routed surface.
 *
 * @param input - {@link LearnShellLayoutProps}
 */
export const LearnShellLayout = (input: LearnShellLayoutProps) => {
    const t = useTranslations("learn.shell")
    const router = useRouter()
    const pathname = usePathname()
    const base = `/courses/${input.displayId}`

    const groups = useMemo(() => GROUPS.map((group) => ({
        id: group.id,
        label: t(`groups.${group.id}`),
        rows: group.rows.map((row) => ({
            id: row.id,
            label: t(`rows.${row.id}`),
            icon: row.icon,
            isCurrent: pathname.startsWith(`${base}${row.at}`),
        })),
    })), [t, pathname, base])

    return (
        <_LearnShellLayout
            props={{
                spine: { lockedLabel: t("locked"), groups },
                tabs: TABS.map((tab) => ({ id: tab.id, label: t(`tabs.${tab.id}`), icon: tab.icon })),
            }}
            on={{
                openRow: (id: string) => {
                    const row = GROUPS.flatMap((group) => group.rows).find((candidate) => candidate.id === id)
                    if (row === undefined) return
                    router.push(`${base}${row.at}`)
                },
            }}
            surface={input.surface}
        />
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
