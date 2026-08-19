"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import fixture from "~candidate/fixtures/coding.json"
import { CodingPracticeHubPageBase } from "~candidate/components/pages/CodingPracticeHubPage/component"
import { CodingDomainPageBase } from "~candidate/components/pages/CodingDomainPage/component"
import { CodingProblemPageBase } from "~candidate/components/pages/CodingProblemPage/component"
import type { JudgeVerdictState } from "~candidate/components/blocks/coding/JudgeStatusStrip/component"
import type { CodingProblemListState } from "~candidate/components/blocks/coding/CodingProblemList/component"
import type { DomainMasteryGridState } from "~candidate/components/blocks/coding/DomainMasteryGrid/component"
import type { ProblemReadingColumnState } from "~candidate/components/blocks/coding/ProblemReadingColumn/component"
import type { SolutionEditorState } from "~candidate/components/blocks/coding/SolutionEditor/component"

/**
 * The state matrix.
 *
 * ONE SCENE, MANY SCENARIOS - not one page per state. Every scenario drives the SAME candidate
 * components from the SAME fixture; the switcher only chooses which situation each owner is in.
 *
 * THE SCENARIOS ARE NAMED BY OWNER, which is the point of this case rather than a detail of it.
 * Three pages carry six owners between them, and each owns its own question: the grid knows whether
 * mastery loaded, the list knows whether the topic is empty, the verdict strip knows what the judge
 * last said. `problem-judging` is the STRIP judging inside a problem page whose editor is idle - a
 * flat page-level state list could not have said that.
 *
 * The chrome adds NO padding around the candidate: each page contract owns its own inset, and a
 * harness that quietly supplies one is how a page shipped without any in an earlier case.
 */

/** One inspectable situation. */
interface Scenario {
    readonly id: string
    readonly label: string
    readonly owner: string
    readonly build: () => React.ReactNode
}

const hub = fixture.hub
const domain = fixture.domain
const problem = fixture.problem

/** A hub page whose topic field is in one named situation. */
const hubScene = (
    state: DomainMasteryGridState,
    extra: { session?: "guest" | "signed-in", resume?: boolean, standing?: boolean } = {},
) => (
    <CodingPracticeHubPageBase
        session={extra.session ?? "signed-in"}
        props={{
            labels: hub.labels,
            domains: { state, items: hub.domains },
            ...(extra.resume === false ? {} : { resume: hub.resume }),
            ...(extra.standing === false ? {} : { standing: hub.standing }),
        }}
    />
)

/** A domain page whose problem list is in one named situation. */
const domainScene = (state: CodingProblemListState) => (
    <CodingDomainPageBase
        props={{
            labels: domain.labels,
            percent: domain.percent,
            problems: {
                state,
                items: domain.problems,
                ...(state === "empty" ? domain.empty : {}),
                ...(state === "all-solved" ? domain.allSolved : {}),
            },
        }}
    />
)

/** A problem page with one named verdict, and the editor situation that goes with it. */
const problemScene = (
    verdict: JudgeVerdictState,
    extra: {
        editor?: SolutionEditorState,
        reading?: ProblemReadingColumnState,
        tab?: "statement" | "hint" | "solution" | "submissions",
        body?: string,
        testcases?: keyof typeof problem.testcases,
        compiler?: boolean,
    } = {},
) => (
    <CodingProblemPageBase
        props={{
            reading: {
                state: extra.reading ?? "ready",
                props: {
                    ...problem.reading,
                    tab: extra.tab ?? "statement",
                    body: extra.body ?? problem.reading.body,
                },
            },
            verdict: {
                state: verdict,
                props: problem.verdicts[verdict],
            },
            editor: {
                state: extra.editor ?? "ready",
                props: {
                    languages: problem.languages,
                    language: "python",
                    source: problem.source,
                    labels: problem.editorLabels,
                    ...(extra.testcases === undefined ? {} : { testcases: problem.testcases[extra.testcases] }),
                    ...(extra.compiler === true ? { compilerMessage: problem.compilerMessage } : {}),
                },
            },
        }}
    />
)

const SCENARIOS: ReadonlyArray<Scenario> = [
    { id: "hub-ready", label: "Hub · có tiến độ", owner: "page", build: () => hubScene("ready") },
    { id: "hub-resting", label: "Hub · đang tải", owner: "block DomainMasteryGrid", build: () => hubScene("pending") },
    { id: "hub-fresh", label: "Hub · chưa làm gì", owner: "page", build: () => hubScene("ready", { resume: false }) },
    { id: "hub-guest", label: "Hub · khách", owner: "page", build: () => hubScene("guest", { session: "guest", resume: false, standing: false }) },
    { id: "hub-progress-failed", label: "Hub · hỏng tiến độ", owner: "block DomainMasteryGrid", build: () => hubScene("progress-failed", { resume: false }) },

    { id: "domain-ready", label: "Chủ đề · có bài", owner: "page", build: () => domainScene("ready") },
    { id: "domain-resting", label: "Chủ đề · đang tải", owner: "block CodingProblemList", build: () => domainScene("pending") },
    { id: "domain-empty", label: "Chủ đề · chưa có bài", owner: "block CodingProblemList", build: () => domainScene("empty") },
    { id: "domain-all-solved", label: "Chủ đề · xong hết", owner: "block CodingProblemList", build: () => domainScene("all-solved") },

    { id: "problem-idle", label: "Bài · chưa nộp", owner: "page", build: () => problemScene("idle") },
    { id: "problem-resting", label: "Bài · đang tải", owner: "block ProblemReadingColumn", build: () => problemScene("idle", { reading: "pending" }) },
    { id: "problem-hint", label: "Bài · tab gợi ý", owner: "block ProblemReadingColumn", build: () => problemScene("idle", { tab: "hint", body: problem.reading.hintBody }) },
    { id: "problem-pending", label: "Bài · đang xếp hàng", owner: "block JudgeStatusStrip", build: () => problemScene("pending", { editor: "submitting" }) },
    { id: "problem-judging", label: "Bài · đang chấm", owner: "block JudgeStatusStrip", build: () => problemScene("judging", { editor: "submitting", testcases: "judging" }) },
    { id: "problem-accepted", label: "Bài · Accepted", owner: "block JudgeStatusStrip", build: () => problemScene("accepted", { editor: "judged", testcases: "accepted" }) },
    { id: "problem-wrong-answer", label: "Bài · sai kết quả", owner: "block JudgeStatusStrip", build: () => problemScene("wrongAnswer", { editor: "judged", testcases: "wrongAnswer" }) },
    { id: "problem-time-limit", label: "Bài · quá thời gian", owner: "block JudgeStatusStrip", build: () => problemScene("timeLimitExceeded", { editor: "judged", testcases: "wrongAnswer" }) },
    { id: "problem-memory-limit", label: "Bài · quá bộ nhớ", owner: "block JudgeStatusStrip", build: () => problemScene("memoryLimitExceeded", { editor: "judged", testcases: "wrongAnswer" }) },
    { id: "problem-runtime-error", label: "Bài · lỗi khi chạy", owner: "block JudgeStatusStrip", build: () => problemScene("runtimeError", { editor: "judged", testcases: "wrongAnswer" }) },
    { id: "problem-compile-error", label: "Bài · lỗi biên dịch", owner: "block JudgeStatusStrip", build: () => problemScene("compileError", { editor: "judged", testcases: "judging", compiler: true }) },
    { id: "problem-internal-error", label: "Bài · máy chấm hỏng", owner: "block JudgeStatusStrip", build: () => problemScene("internalError", { editor: "judged" }) },
    { id: "problem-socket-lost", label: "Bài · mất kết nối", owner: "block JudgeStatusStrip", build: () => problemScene("socket-lost", { editor: "submitting" }) },
]

/**
 * Read the scenario and theme out of the URL once, on mount.
 *
 * EVERY STATE NEEDS ITS OWN ADDRESS: a sealed design record names a `route` per rendered state, and
 * a state reachable only by pressing a control has no route to name. It runs in an effect rather
 * than during render because this is a static export - reading `location` while rendering would
 * make the server and client markup disagree.
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
    // The theme is driven through next-themes, which is what production uses. Toggling a `dark`
    // class on a wrapper here would fight the class `ThemeProvider` writes onto `<html>`.
    const { resolvedTheme, setTheme } = useTheme()
    useUrlState(setScenarioId, setTheme)
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]
    const theme = resolvedTheme === "light" ? "light" : "dark"

    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-wrap items-center gap-2 border-b border-separator p-4">
                {SCENARIOS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        data-scenario={item.id}
                        data-owner={item.owner}
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
            <div data-candidate-root="true" data-state-id={scenario.id} data-theme={theme}>
                {scenario.build()}
            </div>
        </div>
    )
}

export default StateMatrix
