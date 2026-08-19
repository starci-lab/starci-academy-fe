"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import fixture from "~candidate/fixtures/catalog.json"
import {
    CoursesCatalogPageBase,
    type CoursesCatalogPageProps,
    type CoursesCatalogPageState,
} from "~candidate/components/pages/CoursesCatalogPage/component"

/**
 * The state matrix.
 *
 * ONE SCENE, SEVERAL SCENARIOS — not one page per state. Every scenario below drives the SAME
 * candidate component from the SAME fixture; the switcher only chooses which situation it is in.
 * A Cartesian product of pages would have been a second implementation to keep in step, and the
 * first thing to drift.
 *
 * The chrome around the switcher is deliberately plain and unbranded so nothing here can be
 * mistaken for part of the candidate under review. Everything inside the bordered region is the
 * candidate; everything above it is scaffolding.
 */

/** One inspectable situation. */
interface Scenario {
    /** Stable identity, quoted by the design record's `states` collection. */
    readonly id: string
    /** What the reader is looking at. */
    readonly label: string
    /** The props handed to the candidate. */
    readonly build: () => CoursesCatalogPageProps
}

const labels = fixture.labels
const ownedRows = fixture.owned
const discoverRows = fixture.discover

const base = (state: CoursesCatalogPageState): CoursesCatalogPageProps => ({
    state,
    props: {
        labels,
        countLabel: fixture.countLabel,
        owned: ownedRows,
        discover: discoverRows,
        page: fixture.page,
        totalPages: fixture.totalPages,
        view: "grid",
    },
})

const SCENARIOS: ReadonlyArray<Scenario> = [
    {
        id: "populated",
        label: "Populated",
        build: () => base("ready"),
    },
    {
        id: "pending",
        label: "Pending",
        build: () => ({
            state: "pending",
            props: { labels, view: "grid" },
        }),
    },
    {
        id: "no-owned-courses",
        label: "No owned courses",
        build: () => ({
            ...base("ready"),
            props: { ...base("ready").props, owned: [] },
        }),
    },
    {
        id: "no-discount",
        label: "Course at full price",
        build: () => ({
            ...base("ready"),
            props: {
                ...base("ready").props,
                owned: [],
                discover: discoverRows.filter((row) => row.originalPrice === undefined),
            },
        }),
    },
    {
        id: "filtered-empty",
        label: "Filtered empty",
        build: () => ({
            state: "filtered-empty",
            props: {
                labels,
                view: "grid",
                noticeMessage: fixture.notices.filteredEmpty.message,
                noticeActionLabel: fixture.notices.filteredEmpty.actionLabel,
            },
        }),
    },
    {
        id: "empty",
        label: "Empty",
        build: () => ({
            state: "empty",
            props: {
                labels,
                view: "grid",
                noticeMessage: fixture.notices.empty.message,
                noticeActionLabel: fixture.notices.empty.actionLabel,
            },
        }),
    },
    {
        id: "failed",
        label: "Failed",
        build: () => ({
            state: "failed",
            props: {
                labels,
                view: "grid",
                noticeMessage: fixture.notices.failed.message,
                noticeActionLabel: fixture.notices.failed.actionLabel,
            },
        }),
    },
]

/**
 * Read the scenario and theme out of the URL once, on mount.
 *
 * EVERY STATE NEEDS ITS OWN ADDRESS, for two reasons. A sealed design record names a `route` per
 * rendered state, and a state reachable only by pressing a control has no route to name. And the
 * screenshots that record requires are captured by a headless browser, which can open a URL and
 * cannot press anything.
 *
 * It runs in an effect rather than during render because this is a static export: the HTML is
 * generated at build time with no query string, so reading `location` while rendering would make
 * the server and client markup disagree.
 */
const useUrlState = (
    setScenarioId: (id: string) => void,
    setTheme: (theme: string) => void,
) => {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const state = params.get("state")
        if (state !== null && SCENARIOS.some((item) => item.id === state)) setScenarioId(state)
        const theme = params.get("theme")
        if (theme === "light" || theme === "dark") setTheme(theme)
    }, [setScenarioId, setTheme])
}

const StateMatrix = () => {
    const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
    /*
     * REVISION 1.2. The theme is driven through next-themes, which is what production uses, rather
     * than by toggling a `dark` class on a wrapper div here.
     *
     * The wrapper approach looked right and was not: `ThemeProvider` writes its own class onto
     * `<html>`, so the wrapper was fighting an ancestor that always said dark. Light mode came out
     * as white cards on a dark page with unreadable section headings — a broken theme that only a
     * screenshot could show, because every DOM probe reported the classes it expected to see.
     */
    const { resolvedTheme, setTheme } = useTheme()
    useUrlState(setScenarioId, setTheme)
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]
    const candidate = scenario.build()
    const theme = resolvedTheme === "light" ? "light" : "dark"

    return (
        <div>
            <div className="min-h-screen bg-background p-6">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    {SCENARIOS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            data-scenario={item.id}
                            aria-pressed={item.id === scenarioId}
                            onClick={() => setScenarioId(item.id)}
                            className="rounded-full border border-separator px-3 py-1 text-xs text-foreground aria-pressed:border-accent aria-pressed:text-accent"
                        >
                            {item.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        data-theme-toggle="true"
                        onClick={() => { setTheme(theme === "dark" ? "light" : "dark") }}
                        className="rounded-full border border-separator px-3 py-1 text-xs text-foreground"
                    >
                        {theme === "dark" ? "Dark" : "Light"}
                    </button>
                </div>
                <div
                    data-candidate-root="true"
                    data-state-id={scenario.id}
                    data-theme={theme}
                    className="rounded-2xl border border-separator p-4"
                >
                    <CoursesCatalogPageBase {...candidate} />
                </div>
            </div>
        </div>
    )
}

export default StateMatrix
