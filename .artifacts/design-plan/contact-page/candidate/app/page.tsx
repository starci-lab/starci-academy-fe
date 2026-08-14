"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import fixture from "~candidate/fixtures/contact.json"
import {
    _ContactPage,
    type ContactPageProps,
} from "~candidate/components/pages/ContactPage/component"
import type {
    ContactMessageFormState,
} from "~candidate/components/blocks/contact/ContactMessageForm/component"
import type {
    ConversationMessage,
    FounderConversationPanelState,
} from "~candidate/components/blocks/contact/FounderConversationPanel/component"
import type { IconName } from "~candidate/components/leaves/Icon"

/**
 * The state matrix.
 *
 * ONE SCENE, SEVERAL SCENARIOS — not one page per state. Every scenario below drives the SAME
 * candidate component from the SAME fixture; the switcher only chooses which situation it is in.
 *
 * THE SCENARIOS ARE NAMED BY OWNER, and that is the point of this case rather than a detail of it.
 * The page owns one question — is there a session — and the two blocks under it own their own.
 * `guest-submitting` is the FORM submitting inside a guest page; `signed-in-thread-failed` is the
 * PANEL failing inside a signed-in page. A flat list of thirteen page states would have implied
 * one flag driving the whole screen, which PAGE-3 refuses for the reason it gives: the fastest
 * region would wait on the slowest.
 *
 * The chrome around the switcher is deliberately plain and unbranded so nothing here can be
 * mistaken for part of the candidate. It also adds NO padding around the candidate root: the page
 * contract owns `px-6 py-6` itself, and a harness that quietly supplies an inset is how a page
 * shipped without one in an earlier case.
 */

/** One inspectable situation. */
interface Scenario {
    /** Stable identity, quoted by the design record's `states` collection. */
    readonly id: string
    /** What the reader is looking at. */
    readonly label: string
    /** Which owner this scenario is exercising. */
    readonly owner: "page" | "form" | "panel"
    /** The props handed to the candidate. */
    readonly build: () => ContactPageProps
}

const labels = fixture.labels
const channels = fixture.channels.map((channel) => ({ ...channel, mark: channel.mark as IconName }))
const formLabels = fixture.form.labels
const talk = fixture.conversation
const messages = talk.messages as ReadonlyArray<ConversationMessage>

/** A guest page whose form is in one named situation. */
const guest = (
    state: ContactMessageFormState,
    extra: Record<string, unknown> = {},
): ContactPageProps => ({
    session: "guest",
    props: {
        labels,
        channels,
        form: {
            state,
            props: {
                labels: formLabels,
                categories: fixture.form.categories,
                selectedCategory: fixture.form.selectedCategory,
                ...extra,
            },
        },
    },
})

/** A signed-in page whose conversation is in one named situation. */
const signedIn = (
    state: FounderConversationPanelState,
    extra: Record<string, unknown> = {},
): ContactPageProps => ({
    session: "signed-in",
    props: {
        labels,
        channels,
        conversation: {
            state,
            props: {
                labels: talk.labels,
                statusLabel: talk.statusLabel,
                messages,
                ...extra,
            },
        },
    },
})

const SCENARIOS: ReadonlyArray<Scenario> = [
    { id: "guest-ready", label: "Khách · form trống", owner: "page", build: () => guest("ready") },
    {
        id: "guest-invalid",
        label: "Khách · từ chối",
        owner: "form",
        build: () => guest("invalid", { refusals: fixture.form.refusals }),
    },
    { id: "guest-submitting", label: "Khách · đang gửi", owner: "form", build: () => guest("submitting") },
    {
        id: "guest-submitted",
        label: "Khách · đã gửi",
        owner: "form",
        build: () => guest("submitted", fixture.form.submitted),
    },
    {
        id: "guest-failed",
        label: "Khách · gửi hỏng",
        owner: "form",
        build: () => guest("failed", fixture.form.failed),
    },
    { id: "signed-in-ready", label: "Đăng nhập · có hội thoại", owner: "page", build: () => signedIn("ready") },
    { id: "signed-in-resting", label: "Đăng nhập · đang tải", owner: "panel", build: () => signedIn("resting") },
    {
        id: "signed-in-empty",
        label: "Đăng nhập · chưa có tin",
        owner: "panel",
        build: () => signedIn("empty", { messages: [], ...talk.empty }),
    },
    {
        id: "signed-in-sending",
        label: "Đăng nhập · đang gửi",
        owner: "panel",
        build: () => signedIn("sending", { messages: [...messages, talk.pendingMessage] }),
    },
    {
        id: "signed-in-send-failed",
        label: "Đăng nhập · tin hỏng",
        owner: "panel",
        build: () => signedIn("send-failed", { messages: [...messages, talk.failedMessage] }),
    },
    {
        id: "signed-in-thread-failed",
        label: "Đăng nhập · hỏng hội thoại",
        owner: "panel",
        build: () => signedIn("thread-failed", { messages: [], ...talk.threadFailed }),
    },
]

/**
 * Read the scenario and theme out of the URL once, on mount.
 *
 * EVERY STATE NEEDS ITS OWN ADDRESS: a sealed design record names a `route` per rendered state, and
 * a state reachable only by pressing a control has no route to name. The screenshots that record
 * requires are captured by a headless browser, which can open a URL and cannot press anything.
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
    // The theme is driven through next-themes, which is what production uses. Toggling a `dark`
    // class on a wrapper here would fight the class `ThemeProvider` writes onto `<html>`.
    const { resolvedTheme, setTheme } = useTheme()
    useUrlState(setScenarioId, setTheme)
    const scenario = SCENARIOS.find((item) => item.id === scenarioId) ?? SCENARIOS[0]
    const candidate = scenario.build()
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
                <_ContactPage {...candidate} />
            </div>
        </div>
    )
}

export default StateMatrix
