"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import {
    _LearnShellLayout,
    type LearnMobileTab,
    type LearnMobileView,
} from "./component"
import type { LearnSpineGroup } from "@/components/blocks/learn/LearnSpine/component"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryGlobalLeaderboardSwr } from "@/hooks/swr/useQueryGlobalLeaderboardSwr"
import { useQueryMyCoursesSwr } from "@/hooks/swr/useQueryMyCoursesSwr"
import { isLiveAssessmentRoute } from "@/modules/learn/is-live-assessment-route"
import type { ComponentType } from "react"

type LearnMobileViewContextValue = {
    readonly view: LearnMobileView
    readonly openView: (view: LearnMobileView) => void
}

const LearnMobileViewContext = createContext<LearnMobileViewContextValue | undefined>(undefined)

/** Read the learn layout's current mobile panel from a routed page. */
export const useLearnMobileView = (): LearnMobileViewContextValue => {
    const value = useContext(LearnMobileViewContext)
    if (value === undefined) {
        throw new Error("useLearnMobileView must be used inside LearnShellLayout")
    }
    return value
}

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
    /** This surface stays visible but reports the course enrolment gate. */
    readonly requiresEnrollment?: boolean
}

/** The three groups, and the routes inside each. */
const GROUPS: ReadonlyArray<{ id: string, rows: ReadonlyArray<SpineRoute> }> = [
    {
        id: "path",
        rows: [
            { id: "content", icon: "course", at: "/learn/content" },
            { id: "personalProject", icon: "practice", at: "/learn/personal-project", requiresEnrollment: true },
        ],
    },
    {
        id: "practice",
        rows: [
            { id: "flashcards", icon: "review", at: "/learn/flashcards" },
            { id: "mockInterview", icon: "talents", at: "/learn/mock-interview", requiresEnrollment: true },
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
const TODAY_TABS: ReadonlyArray<{ id: LearnMobileView, icon: LearnMobileTab["icon"] }> = [
    { id: "today", icon: "course" },
    { id: "course", icon: "explore" },
    { id: "progress", icon: "league" },
]

const READER_TABS: ReadonlyArray<{ id: LearnMobileView, icon: LearnMobileTab["icon"] }> = [
    { id: "contents", icon: "explore" },
    { id: "lesson", icon: "course" },
    { id: "outline", icon: "blog" },
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
    const course = useQueryCourseSwr({ displayId: input.displayId })
    const enrolledCourses = useQueryMyCoursesSwr()
    const leaderboard = useQueryGlobalLeaderboardSwr()

    const enrolledCourse = enrolledCourses.data?.find((candidate) => candidate.globalId === course.data?.id)
    const enrollmentKnown = course.data !== undefined
    const viewerRank = leaderboard.data?.myRank

    const isReader = pathname.includes("/learn/content/modules/")
        && pathname.includes("/contents/")
        && !pathname.includes("/challenges/")
    const isToday = pathname === `${base}/learn`
    const routeDefault: LearnMobileView = isToday ? "today" : isReader ? "lesson" : "course"
    const validViews = useMemo<ReadonlyArray<LearnMobileView>>(() => (
        isToday
            ? TODAY_TABS.map((tab) => tab.id)
            : isReader
                ? READER_TABS.map((tab) => tab.id)
                : [routeDefault]
    ), [isReader, isToday, routeDefault])
    const [mobileView, setMobileView] = useState<LearnMobileView>(routeDefault)
    useEffect(() => {
        if (!validViews.includes(mobileView)) setMobileView(routeDefault)
    }, [mobileView, routeDefault, validViews])
    const isFullBleed = isLiveAssessmentRoute(pathname)

    const groups = useMemo(() => GROUPS.map((group) => ({
        id: group.id,
        label: t(`groups.${group.id}`),
        rows: group.rows.map((row) => ({
            id: row.id,
            label: t(`rows.${row.id}`),
            icon: row.icon,
            isCurrent: pathname.startsWith(`${base}${row.at}`),
            isLocked: row.requiresEnrollment === true && enrollmentKnown && course.data?.isEnrolled !== true,
            fact: row.id === "leaderboard" && viewerRank !== null && viewerRank !== undefined
                ? `#${viewerRank}`
                : undefined,
        })),
    })), [t, pathname, base, enrollmentKnown, course.data?.isEnrolled, viewerRank])

    const tabs = isToday ? TODAY_TABS : isReader ? READER_TABS : undefined

    return (
        <LearnMobileViewContext.Provider value={{ view: mobileView, openView: setMobileView }}>
            <_LearnShellLayout
                props={{
                    spine: {
                        lockedLabel: t("locked"),
                        groups,
                        ...(enrolledCourse === undefined ? {} : {
                            resume: {
                                label: t("resume"),
                                title: enrolledCourse.label,
                                percent: enrolledCourse.completionPercent,
                                percentText: t("progress", { percent: enrolledCourse.completionPercent }),
                            },
                        }),
                    },
                    mobileTabs: tabs
                        ? tabs.map((tab) => ({
                            id: tab.id,
                            label: t(`tabs.${tab.id}`),
                            icon: tab.icon,
                            isCurrent: tab.id === mobileView,
                        }))
                        : undefined,
                    isFullBleed,
                }}
                on={{
                    openRow: (id: string) => {
                        const row = GROUPS.flatMap((group) => group.rows).find((candidate) => candidate.id === id)
                        if (row === undefined) return
                        router.push(`${base}${row.at}`)
                    },
                    openMobileTab: (id: string) => {
                        const next = validViews.find((view) => view === id)
                        if (next !== undefined) setMobileView(next)
                    },
                    resume: () => router.push(`${base}/learn/content`),
                }}
                surface={input.surface}
            />
        </LearnMobileViewContext.Provider>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
