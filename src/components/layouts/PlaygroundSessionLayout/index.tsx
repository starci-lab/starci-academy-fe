"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ComponentType } from "react"
import { useQueryPlaygroundSwr } from "@/hooks/swr/useQueryPlaygroundSwr"
import { useMutateStartPlaygroundSessionSwr } from "@/hooks/swr/useMutateStartPlaygroundSessionSwr"
import { usePlaygroundSocketIo } from "@/hooks/socketio/usePlaygroundSocketIo"
import type { Playground } from "@/modules/api/graphql/queries/query-playground"
import type { PlaygroundSession } from "@/modules/api/graphql/mutations/mutation-start-playground-session"
import { _PlaygroundSessionLayout } from "./component"

/** Persistent playground data and live actions shared by setup and session routes. */
export type PlaygroundSessionContextValue = {
    readonly displayId: string
    readonly slug: string
    readonly playground: Playground | null | undefined
    readonly session: PlaygroundSession | null
    readonly isLoading: boolean
    readonly isStarting: boolean
    readonly failed: boolean
    readonly startFailed: boolean
    readonly socketState: ReturnType<typeof usePlaygroundSocketIo>["state"]
    readonly agentConnected: boolean
    readonly verifiedStepIndex: number | null
    readonly passedStepIndexes: ReadonlyArray<number>
    readonly start: () => Promise<boolean>
    readonly verify: () => void
    readonly retry: () => void
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
    readonly surface: ComponentType
}

/** Resolve the playground once and preserve its server session and relay socket across navigation. */
export const PlaygroundSessionLayout = (input: PlaygroundSessionLayoutProps) => {
    const playground = useQueryPlaygroundSwr(input.slug)
    const startMutation = useMutateStartPlaygroundSessionSwr(playground.data?.id)
    const socket = usePlaygroundSocketIo()
    const [session, setSession] = useState<PlaygroundSession | null>(null)
    const [startFailed, setStartFailed] = useState(false)

    const start = useCallback(async () => {
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
            socket.subscribe(created.id)
            return true
        } catch {
            setStartFailed(true)
            return false
        }
    }, [playground.data, socket, startMutation])

    const value = useMemo<PlaygroundSessionContextValue>(() => ({
        displayId: input.displayId,
        slug: input.slug,
        playground: playground.data,
        session,
        isLoading: playground.data === undefined && playground.error === undefined,
        isStarting: startMutation.isMutating,
        failed: playground.error !== undefined,
        startFailed,
        socketState: socket.state,
        agentConnected: socket.agentConnected,
        verifiedStepIndex: socket.verifiedStepIndex,
        passedStepIndexes: socket.passedStepIndexes,
        start,
        verify: socket.verify,
        retry: () => {
            setStartFailed(false)
            void playground.mutate()
        },
    }), [input.displayId, input.slug, playground.data, playground.error, playground.mutate, session, startFailed, startMutation.isMutating, socket, start])

    return (
        <PlaygroundSessionContext.Provider value={value}>
            <_PlaygroundSessionLayout
                state={value.failed ? "failed" : value.isLoading ? "pending" : "ready"}
                surface={input.surface}
                failedLabel="The playground could not be loaded."
            />
        </PlaygroundSessionContext.Provider>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "connected", domain: "learn" } as const
