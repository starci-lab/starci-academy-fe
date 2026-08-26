"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useTranslations } from "next-intl"
import { useQueryPlaygroundSwr } from "@/hooks/swr/useQueryPlaygroundSwr"
import { useMutateStartPlaygroundSessionSwr } from "@/hooks/swr/useMutateStartPlaygroundSessionSwr"
import { usePlaygroundSocketIo } from "@/hooks/socketio/usePlaygroundSocketIo"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"
import type { PlaygroundSession } from "@/modules/api/graphql/mutations/mutation-start-playground-session"
import { PlaygroundSessionLayoutBase } from "./component"

/** Persistent playground data and live actions shared by setup and session routes. */
export type PlaygroundSessionContextValue = {
    readonly displayId: string
    readonly slug: string
    readonly playground: Playground | null | undefined
    readonly session: PlaygroundSession | null
    readonly isLoading: boolean
    readonly isRestoring: boolean
    readonly isStarting: boolean
    readonly failed: boolean
    readonly startFailed: boolean
    readonly socketState: ReturnType<typeof usePlaygroundSocketIo>["state"]
    readonly agentConnected: boolean
    readonly hasPaired: boolean
    readonly verifiedStepIndex: number | null
    readonly passedStepIndexes: ReadonlyArray<number>
    readonly start: () => Promise<boolean>
    readonly verify: () => void
    readonly retry: () => void
}

const storageKeysFor = (displayId: string, slug: string) => {
    const identity = `${encodeURIComponent(displayId)}/${encodeURIComponent(slug)}`
    return {
        session: `starci:playground-session:v1:${identity}`,
        paired: `starci:playground-paired:v1:${identity}`,
    } as const
}

const storedSessionFrom = (key: string): PlaygroundSession | null => {
    if (typeof window === "undefined") return null
    const value = window.sessionStorage.getItem(key)
    if (value === null) return null
    try {
        const parsed: unknown = JSON.parse(value)
        if (typeof parsed !== "object" || parsed === null || !("id" in parsed) || typeof parsed.id !== "string") {
            window.sessionStorage.removeItem(key)
            return null
        }
        return parsed as PlaygroundSession
    } catch {
        window.sessionStorage.removeItem(key)
        return null
    }
}

const PlaygroundSessionContext = createContext<PlaygroundSessionContextValue | null>(null)

/** Read the persistent setup-to-session owner mounted at the slug layout boundary. */
export const usePlaygroundSession = () => {
    const value = useContext(PlaygroundSessionContext)
    if (value === null) throw new Error("usePlaygroundSession must be used inside PlaygroundSessionLayout")
    return value
}

/** Inputs supplied by the playground slug route layout. */
export type PlaygroundSessionLayoutProps = {
    readonly displayId: string
    readonly slug: string
    readonly surface: ReactNode
}

/** Resolve the playground once and preserve its server session and relay socket across navigation. */
export const PlaygroundSessionLayout = (input: PlaygroundSessionLayoutProps) => {
    const t = useTranslations("learn.playground")
    const playground = useQueryPlaygroundSwr(input.slug)
    const startMutation = useMutateStartPlaygroundSessionSwr(playground.data?.id)
    const socket = usePlaygroundSocketIo()
    const [session, setSession] = useState<PlaygroundSession | null>(null)
    const [isRestoring, setIsRestoring] = useState(true)
    const [hasPaired, setHasPaired] = useState(false)
    const [startFailed, setStartFailed] = useState(false)
    const subscribedSessionId = useRef<string | null>(null)
    const storageKeys = useMemo(() => storageKeysFor(input.displayId, input.slug), [input.displayId, input.slug])

    useEffect(() => {
        setSession(storedSessionFrom(storageKeys.session))
        setHasPaired(typeof window !== "undefined" && window.sessionStorage.getItem(storageKeys.paired) === "true")
        setIsRestoring(false)
    }, [storageKeys])

    useEffect(() => {
        if (isRestoring || session === null || subscribedSessionId.current === session.id) return
        subscribedSessionId.current = session.id
        socket.subscribe(session.id)
    }, [isRestoring, session, socket])

    useEffect(() => {
        if (session === null || typeof window === "undefined") return
        window.sessionStorage.setItem(storageKeys.session, JSON.stringify(session))
    }, [session, storageKeys.session])

    useEffect(() => {
        if (!socket.agentConnected || typeof window === "undefined") return
        setHasPaired(true)
        window.sessionStorage.setItem(storageKeys.paired, "true")
    }, [socket.agentConnected, storageKeys.paired])

    const start = useCallback(async () => {
        if (isRestoring) return false
        if (session !== null) return true
        if (playground.data === undefined || playground.data === null) return false
        setStartFailed(false)
        try {
            const result = await startMutation.trigger({ playgroundId: playground.data.id, mode: "guided" })
            const created = result.data?.createPlaygroundSession.data
            if (created === undefined || created === null) {
                setStartFailed(true)
                return false
            }
            setSession(created)
            return true
        } catch {
            setStartFailed(true)
            return false
        }
    }, [isRestoring, playground.data, session, startMutation])

    const retry = useCallback(() => {
        setStartFailed(false)
        void playground.mutate()
        if (session === null) return
        subscribedSessionId.current = session.id
        socket.subscribe(session.id)
    }, [playground.mutate, session, socket])

    const value = useMemo<PlaygroundSessionContextValue>(() => ({
        displayId: input.displayId,
        slug: input.slug,
        playground: playground.data,
        session,
        isLoading: isRestoring || (playground.data === undefined && playground.error === undefined),
        isRestoring,
        isStarting: startMutation.isMutating,
        failed: playground.error !== undefined,
        startFailed,
        socketState: socket.state,
        agentConnected: socket.agentConnected,
        hasPaired,
        verifiedStepIndex: socket.verifiedStepIndex,
        passedStepIndexes: socket.passedStepIndexes,
        start,
        verify: socket.verify,
        retry,
    }), [hasPaired, input.displayId, input.slug, isRestoring, playground.data, playground.error, retry, session, startFailed, startMutation.isMutating, socket, start])

    return (
        <PlaygroundSessionContext.Provider value={value}>
            <PlaygroundSessionLayoutBase
                state={value.failed ? "failed" : value.isLoading ? "pending" : "ready"}
                surface={input.surface}
                failedLabel={t("layoutFailed")}
                retryLabel={t("retry")}
                onRetry={value.retry}
            />
        </PlaygroundSessionContext.Provider>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
