"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSessionToken } from "@/hooks/auth/useSessionToken"

const PLAYGROUND_NAMESPACE = "/playground_byom"
const SUBSCRIBE_EVENT = "browser:subscribe"
const VERIFY_EVENT = "verify:now"
const STEP_VERIFIED_EVENT = "step:verified"
const AGENT_CONNECTED_EVENT = "agent:connected"
const AGENT_DISCONNECTED_EVENT = "agent:disconnected"

/** Browser relay connection states exposed to the persistent playground layout. */
export type PlaygroundSocketState = "idle" | "connecting" | "connected" | "reconnecting" | "failed"

type StepVerifiedMessage = { readonly data?: { readonly stepIndex?: number } }
type AgentConnectionMessage = { readonly connected?: boolean }

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
            setPassedStepIndexes((current) => current.includes(stepIndex)
                ? current
                : [...current, stepIndex].sort((left, right) => left - right))
        }

        socket.on("connect", subscribeCurrent)
        socket.on("disconnect", onDisconnect)
        socket.on("connect_error", onConnectError)
        socket.on(AGENT_CONNECTED_EVENT, onAgentConnected)
        socket.on(AGENT_DISCONNECTED_EVENT, onAgentDisconnected)
        socket.on(STEP_VERIFIED_EVENT, onStepVerified)

        return () => {
            socket.off("connect", subscribeCurrent)
            socket.off("disconnect", onDisconnect)
            socket.off("connect_error", onConnectError)
            socket.off(AGENT_CONNECTED_EVENT, onAgentConnected)
            socket.off(AGENT_DISCONNECTED_EVENT, onAgentDisconnected)
            socket.off(STEP_VERIFIED_EVENT, onStepVerified)
            socket.disconnect()
            socketRef.current = null
        }
    }, [token])

    const subscribe = useCallback((sessionId: string) => {
        sessionIdRef.current = sessionId
        setVerifiedStepIndex(null)
        setPassedStepIndexes([])
        socketRef.current?.emit(SUBSCRIBE_EVENT, { sessionId })
    }, [])

    const verify = useCallback(() => {
        if (sessionIdRef.current !== null) {
            socketRef.current?.emit(VERIFY_EVENT, { sessionId: sessionIdRef.current })
        }
    }, [])

    return { state, agentConnected, verifiedStepIndex, passedStepIndexes, subscribe, verify }
}
