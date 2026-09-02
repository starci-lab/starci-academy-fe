"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { isLiveAssessmentRoute } from "@/modules/learn/is-live-assessment-route"
import { LEARN_RAIL_COLLAPSED_KEY } from "@/components/blocks/learn/LearnSpine"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { LearnShellLayoutBase, type LearnMobileTab, type LearnMobileView } from "./component"

type LearnMobileViewContextValue = { readonly view: LearnMobileView; readonly openView: (view: LearnMobileView) => void }
const LearnMobileViewContext = createContext<LearnMobileViewContextValue | undefined>(undefined)

/** Read the learn layout's current mobile panel from a routed page. */
export const useLearnMobileView = (): LearnMobileViewContextValue => {
    const value = useContext(LearnMobileViewContext)
    if (value === undefined) throw new Error("useLearnMobileView must be used inside LearnShellLayout")
    return value
}

/** What the route hands the learn frame; course navigation is owned by LearnSpine. */
export interface LearnShellLayoutProps { readonly displayId: string; readonly surface: ReactNode }

const TODAY_TABS: ReadonlyArray<{ id: LearnMobileView; icon: LearnMobileTab["icon"] }> = [
    { id: "today", icon: "course" }, { id: "course", icon: "explore" }, { id: "progress", icon: "league" },
]
const READER_TABS: ReadonlyArray<{ id: LearnMobileView; icon: LearnMobileTab["icon"] }> = [
    { id: "contents", icon: "explore" }, { id: "lesson", icon: "course" }, { id: "outline", icon: "blog" },
]
/** Draw the learn frame while its connected navigation block owns course data and rail state. */
export const LearnShellLayout = (props: LearnShellLayoutProps) => {
    const t = useTranslations("learn.shell")
    const pathname = usePathname()
    const course = useQueryCourseSwr({ displayId: props.displayId })
    const base = `/courses/${props.displayId}`
    const isReader = pathname.includes("/learn/content/modules/") && pathname.includes("/contents/") && !pathname.includes("/challenges/")
    const isToday = pathname === `${base}/learn`
    const routeDefault: LearnMobileView = isToday ? "today" : isReader ? "lesson" : "course"
    const validViews = useMemo<ReadonlyArray<LearnMobileView>>(() => isToday ? TODAY_TABS.map((tab) => tab.id) : isReader ? READER_TABS.map((tab) => tab.id) : [routeDefault], [isReader, isToday, routeDefault])
    const [mobileView, setMobileView] = useState<LearnMobileView>(routeDefault)
    const [isCourseNavigationOpen, setIsCourseNavigationOpen] = useState(false)
    const [isRailCollapsed, setIsRailCollapsed] = useState(false)
    useEffect(() => {
        if (typeof window.localStorage.getItem === "function") setIsRailCollapsed(window.localStorage.getItem(LEARN_RAIL_COLLAPSED_KEY) === "true")
    }, [])
    useEffect(() => { if (!validViews.includes(mobileView)) setMobileView(routeDefault) }, [mobileView, routeDefault, validViews])
    useEffect(() => { setIsCourseNavigationOpen(false) }, [pathname])
    const tabs = isToday ? TODAY_TABS : isReader ? READER_TABS : undefined
    const fullBleed = isLiveAssessmentRoute(pathname)
    return <LearnMobileViewContext.Provider value={{ view: mobileView, openView: setMobileView }}>
        <LearnShellLayoutBase
            displayId={props.displayId}
            navigationLabel={t("mobileCourseNavigation")}
            mobileTabs={tabs?.map((tab) => ({ id: tab.id, label: t(`tabs.${tab.id}`), icon: tab.icon, isCurrent: tab.id === mobileView }))}
            mobileCourseNavigation={tabs !== undefined || fullBleed ? undefined : {
                label: t("mobileCourseNavigation"),
                closeLabel: t("closeMobileCourseNavigation"),
                courseTitle: course.data?.title ?? props.displayId,
                isOpen: isCourseNavigationOpen,
            }}
            isFullBleed={fullBleed}
            isRailCollapsed={isRailCollapsed}
            on={{
                openMobileTab: (id) => { const next = validViews.find((view) => view === id); if (next !== undefined) setMobileView(next) },
                openCourseNavigation: () => setIsCourseNavigationOpen(true),
                closeCourseNavigation: () => setIsCourseNavigationOpen(false),
                setRailCollapsed: setIsRailCollapsed,
            }}
            surface={props.surface}
        />
    </LearnMobileViewContext.Provider>
}
