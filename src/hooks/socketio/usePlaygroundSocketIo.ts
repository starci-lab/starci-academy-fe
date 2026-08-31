"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSessionToken } from "@/hooks/auth/useSessionToken"

const PLAYGROUND_NAMESPACE = "/playground_byom"
const SUBSCRIBE_EVENT = "browser:subscribe"
const VERIFY_EVENT = "verify:now"
const STEP_VERIFIED_EVENT = "step:verified"
const SESSION_PROGRESS_EVENT = "session:progress"
const AGENT_CONNECTED_EVENT = "agent:connected"
const AGENT_DISCONNECTED_EVENT = "agent:disconnected"

/** Browser relay connection states exposed to the persistent playground layout. */
export type PlaygroundSocketState = "idle" | "connecting" | "connected" | "reconnecting" | "failed"

type StepVerifiedMessage = { readonly data?: { readonly stepIndex?: number } }
type SessionProgressMessage = {
    readonly currentStepIndex?: number
    readonly passedStepIndexes?: ReadonlyArray<number>
}
type AgentConnectionMessage = { readonly connected?: boolean }

const progressStorageKeyFor = (sessionId: string) => `starci:playground-progress:v1:${encodeURIComponent(sessionId)}`

const storedPassedStepsFrom = (sessionId: string): ReadonlyArray<number> => {
    if (typeof window === "undefined") return []
    const key = progressStorageKeyFor(sessionId)
    const raw = window.sessionStorage.getItem(key)
    if (raw === null) return []
    try {
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed) || parsed.some((value) => !Number.isInteger(value) || value < 0)) throw new Error("invalid progress")
        return [...new Set(parsed as Array<number>)].sort((left, right) => left - right)
    } catch {
        window.sessionStorage.removeItem(key)
        return []
    }
}

/** Keep one browser relay connection alive while setup navigates into the live session route. */
export const usePlaygroundSocketIo = () => {
    const token = useSessionToken()
    const socketRef = useRef<Socket | null>(null)
    const sessionIdRef = useRef<string | null>(null)
    const [state, setState] = useState<PlaygroundSocketState>("idle")
    const [agentConnected, setAgentConnected] = useState(false)
    const [verifiedStepIndex, setVerifiedStepIndex] = useState<number | null>(null)
    const [passedStepIndexes, setPassedStepIndexes] = useState<ReadonlyArray<number>>([])

    useEffect(() => {
        if (token === undefined) {
            setState("idle")
            return undefined
        }

        setState("connecting")
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
        const socket = io(`${baseUrl}${PLAYGROUND_NAMESPACE}`, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
        })
        socketRef.current = socket

        const subscribeCurrent = () => {
            setState("connected")
            if (sessionIdRef.current !== null) socket.emit(SUBSCRIBE_EVENT, { sessionId: sessionIdRef.current })
        }
        const onDisconnect = () => {
            setState("reconnecting")
            setAgentConnected(false)
        }
        const onConnectError = () => setState("failed")
        const onAgentConnected = (message: AgentConnectionMessage) => setAgentConnected(message.connected !== false)
        const onAgentDisconnected = () => setAgentConnected(false)
        const onStepVerified = (message: StepVerifiedMessage) => {
            const stepIndex = message.data?.stepIndex
            if (stepIndex === undefined) return
            setVerifiedStepIndex(stepIndex)
            setPassedStepIndexes((current) => {
                const next = current.includes(stepIndex)
                    ? current
                    : [...current, stepIndex].sort((left, right) => left - right)
                if (sessionIdRef.current !== null && typeof window !== "undefined") {
                    window.sessionStorage.setItem(progressStorageKeyFor(sessionIdRef.current), JSON.stringify(next))
                }
                return next
            })
        }
        const onSessionProgress = (message: SessionProgressMessage) => {
            const passed = message.passedStepIndexes
            if (!Array.isArray(passed) || passed.some((value) => !Number.isInteger(value) || value < 0)) return
            const next = [...new Set(passed)].sort((left, right) => left - right)
            setPassedStepIndexes(next)
            if (sessionIdRef.current !== null && typeof window !== "undefined") {
                window.sessionStorage.setItem(progressStorageKeyFor(sessionIdRef.current), JSON.stringify(next))
            }
        }

        socket.on("connect", subscribeCurrent)
        socket.on("disconnect", onDisconnect)
        socket.on("connect_error", onConnectError)
        socket.on(AGENT_CONNECTED_EVENT, onAgentConnected)
        socket.on(AGENT_DISCONNECTED_EVENT, onAgentDisconnected)
        socket.on(STEP_VERIFIED_EVENT, onStepVerified)
        socket.on(SESSION_PROGRESS_EVENT, onSessionProgress)

        return () => {
            socket.off("connect", subscribeCurrent)
            socket.off("disconnect", onDisconnect)
            socket.off("connect_error", onConnectError)
            socket.off(AGENT_CONNECTED_EVENT, onAgentConnected)
            socket.off(AGENT_DISCONNECTED_EVENT, onAgentDisconnected)
            socket.off(STEP_VERIFIED_EVENT, onStepVerified)
            socket.off(SESSION_PROGRESS_EVENT, onSessionProgress)
            socket.disconnect()
            socketRef.current = null
        }
    }, [token])

    const subscribe = useCallback((sessionId: string) => {
        const changedSession = sessionIdRef.current !== sessionId
        sessionIdRef.current = sessionId
        setVerifiedStepIndex(null)
        if (changedSession) setPassedStepIndexes(storedPassedStepsFrom(sessionId))
        socketRef.current?.emit(SUBSCRIBE_EVENT, { sessionId })
    }, [])

    const verify = useCallback(() => {
        if (sessionIdRef.current !== null) {
            socketRef.current?.emit(VERIFY_EVENT, { sessionId: sessionIdRef.current })
        }
    }, [])

    const retry = useCallback(() => {
        setState("connecting")
        socketRef.current?.connect()
    }, [])

    return { state, agentConnected, verifiedStepIndex, passedStepIndexes, subscribe, verify, retry }
}
