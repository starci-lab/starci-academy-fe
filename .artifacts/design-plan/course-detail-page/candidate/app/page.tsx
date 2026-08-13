"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import fixture from "~candidate/fixtures/course-detail.json"
import {
    _CourseDetailPage,
    type CourseDetailPageProps,
} from "~candidate/components/pages/CourseDetailPage/component"

/**
 * The state matrix.
 *
 * ONE SCENE, SEVERAL SCENARIOS — not one page per state. Every scenario drives the SAME candidate
 * component from the SAME fixture; the switcher only chooses which situation it is in. A Cartesian
 * product of pages would be a second implementation to keep in step, and the first thing to drift.
 *
 * The chrome around the switcher is deliberately plain and unbranded so nothing here can be mistaken
 * for part of the candidate. Everything inside the bordered region is the candidate.
 */

/** One inspectable situation. */
interface Scenario {
    /** Stable identity, quoted by the design record's `states` collection. */
    readonly id: string
    /** What the reader is looking at. */
    readonly label: string
    /** The props handed to the candidate. */
    readonly build: () => CourseDetailPageProps
}

const labels = fixture.labels
const ready = (): CourseDetailPageProps => ({
    state: "ready",
    props: {
        labels,
        title: fixture.title,
        tagline: fixture.tagline,
        stats: fixture.stats,
        valueProps: fixture.valueProps,
        modules: fixture.modules,
        rail: fixture.rail,
        railState: "ready",
    },
})

const SCENARIOS: ReadonlyArray<Scenario> = [
    { id: "populated", label: "Populated", build: ready },
    {
        id: "price-pending",
        label: "Price pending",
        build: () => ({
            ...ready(),
            props: { ...ready().props, railState: "price-pending" },
        }),
    },
    {
        id: "guest-no-loyalty",
        label: "Guest · no discount",
        build: () => ({
            ...ready(),
            props: {
                ...ready().props,
                rail: {
                    ...fixture.rail,
                    originalPrice: undefined,
                    discountLabel: undefined,
                    savingsLabel: undefined,
                    ctaLabel: "Xem khóa học",
                },
            },
        }),
    },
    {
        id: "no-phases",
        label: "No phase ladder",
        build: () => ({
            ...ready(),
            props: { ...ready().props, rail: { ...fixture.rail, phases: [] } },
        }),
    },
    {
        id: "slots-scarcity",
        label: "Scarcity line",
        build: () => ({
            ...ready(),
            props: {
                ...ready().props,
                rail: { ...fixture.rail, scarcityLabel: fixture.scarcityLabel },
            },
        }),
    },
    {
        id: "no-challenges",
        label: "Fewer stats",
        build: () => ({
            ...ready(),
            props: { ...ready().props, stats: fixture.stats.slice(0, 3) },
        }),
    },
    { id: "pending", label: "Skeleton", build: () => ({ state: "pending", props: { labels } }) },
    {
        id: "not-found",
        label: "Not found",
        build: () => ({
            state: "not-found",
            props: { labels, noticeMessage: fixture.notices.notFound.message },
        }),
    },
    {
        id: "failed",
        label: "Failed",
        build: () => ({
            state: "failed",
            props: {
                labels,
                noticeMessage: fixture.notices.failed.message,
                noticeActionLabel: fixture.notices.failed.actionLabel,
            },
        }),
    },
]

const StateMatrix = () => {
    const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id)
    // The theme belongs to `next-themes`, which writes the class onto `<html>`. An earlier version
    // of this harness kept its own `useState` and put `dark` on a wrapper div instead - the control
    // flipped, the class appeared, and the background never moved, because every token resolves at
    // the document root. Measuring it is what caught that: the light and dark backgrounds came back
    // byte-identical while the record claimed the theme was covered.
    const { resolvedTheme, setTheme } = useTheme()
    const theme = resolvedTheme === "light" ? "light" : "dark"
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]

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
                    <_CourseDetailPage {...scenario.build()} />
                </div>
            </div>
        </div>
    )
}

export default StateMatrix
