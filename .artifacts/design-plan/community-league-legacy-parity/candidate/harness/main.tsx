import { StrictMode, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"
import { I18nProvider } from "@heroui/react"
import { Tree } from "@/components/branches/Tree"
import { ChoiceTabs } from "@/components/leaves/ChoiceTabs"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"
import { LeaderboardSection, LeagueBoard, type LeaderboardSectionData, type LeagueBoardData } from "../src/surfaces"
import community from "../src/fixtures/community.json"
import league from "../src/fixtures/league.json"
import "./styles.css"

/**
 * Scenario harness for the candidate. It is review scaffolding, not a target file: every scenario
 * below hands the SAME components the same resolved fixtures the connected blocks will hand them.
 */

type ScenarioId =
    | "community-populated"
    | "community-loading"
    | "league-global"
    | "league-weekly"
    | "league-self-below-slice"
    | "league-rank-one-no-meter"

const SCENARIOS: ReadonlyArray<{ id: ScenarioId, label: string, stateId: string }> = [
    { id: "community-populated", label: "Community · populated", stateId: "community-populated-dark-desktop-vi-owner" },
    { id: "community-loading", label: "Community · loading", stateId: "community-loading-dark-desktop-vi-owner" },
    { id: "league-global", label: "Page · global", stateId: "league-global-dark-desktop-vi-owner" },
    { id: "league-weekly", label: "Page · weekly", stateId: "league-weekly-dark-desktop-vi-owner" },
    { id: "league-self-below-slice", label: "Page · self below slice", stateId: "league-selfbelow-dark-desktop-vi-owner" },
    { id: "league-rank-one-no-meter", label: "Page · rank 1, meter omitted", stateId: "league-rankone-dark-desktop-vi-owner" },
]

const asSection = (input: unknown) => input as LeaderboardSectionData
const asBoard = (input: unknown) => input as LeagueBoardData

/**
 * Each scenario is addressable as `?scenario=<id>`.
 *
 * A state that only exists after somebody clicks is a state nobody can capture, cite or reopen. The
 * design record already claims a route per state; this is what makes that claim resolvable.
 */
const initialScenario = (): ScenarioId => {
    const requested = new URLSearchParams(window.location.search).get("scenario")
    return SCENARIOS.some((entry) => entry.id === requested)
        ? requested as ScenarioId
        : "community-populated"
}

const Harness = () => {
    const [scenario, setScenario] = useState<ScenarioId>(initialScenario)

    const body = useMemo(() => {
        if (scenario === "community-populated" || scenario === "community-loading") {
            const isLoading = scenario === "community-loading"
            return (
                <Tree
                    contract="dashboard-community-main"
                    render={defineContractComponent("dashboard-community-main", {
                        section: [
                            defineContractProjection("label-row-over-card", () => (
                                <LeaderboardSection props={asSection(community.weekly)} isLoading={isLoading} />
                            )),
                            defineContractProjection("label-row-over-card", () => (
                                <LeaderboardSection props={asSection(community.global)} isLoading={isLoading} />
                            )),
                        ],
                    })}
                />
            )
        }
        const isWeekly = scenario === "league-weekly"
        const base = isWeekly ? league.weekly : league.global
        const board = asBoard({
            ...base,
            meLabel: league.meLabel,
            anonymousLabel: league.anonymousLabel,
            ...(scenario === "league-self-below-slice" ? league.selfBelowSlice : {}),
            ...(scenario === "league-rank-one-no-meter" ? { progress: undefined } : {}),
        })
        return (
            <div className="flex w-full flex-col gap-6">
                <h1 className="text-2xl font-bold">{league.pageTitle}</h1>
                <ChoiceTabs
                    props={{
                        label: league.pageTitle,
                        selectedKey: isWeekly ? "weekly" : "global",
                        variant: "primary",
                        tabs: [
                            { id: "weekly", label: league.tabWeekly },
                            { id: "global", label: league.tabGlobal },
                        ],
                    }}
                    on={{ select: (key: string) => setScenario(key === "weekly" ? "league-weekly" : "league-global") }}
                />
                <LeagueBoard props={board} />
            </div>
        )
    }, [scenario])

    const active = SCENARIOS.find((entry) => entry.id === scenario)

    return (
        <I18nProvider locale="vi">
            <div className="min-h-screen bg-background p-6 text-foreground" data-state-id={active?.stateId}>
                <div className="mx-auto flex w-full max-w-app-sm flex-col gap-6">
                    <div className="flex flex-wrap gap-2">
                        {SCENARIOS.map((entry) => (
                            <button
                                key={entry.id}
                                type="button"
                                data-scenario={entry.id}
                                aria-pressed={entry.id === scenario}
                                onClick={() => setScenario(entry.id)}
                                className="rounded-full border border-separator px-3 py-1 text-xs aria-pressed:border-accent aria-pressed:text-accent"
                            >
                                {entry.label}
                            </button>
                        ))}
                    </div>
                    {body}
                </div>
            </div>
        </I18nProvider>
    )
}

createRoot(document.querySelector("#root") as HTMLElement).render(
    <StrictMode><Harness /></StrictMode>,
)
