"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { io, type Socket } from "socket.io-client"
import { useSessionToken } from "../auth/useSessionToken"

const MOCK_INTERVIEW_NAMESPACE = "/mock_interview"
const ASK_EVENT = "mock_interview.ask.publication"
const ABORT_EVENT = "mock_interview.abort.publication"
const CHUNK_EVENT = "mock_interview.chunk.subscription"

/** Minimal transcript turn sent to the streaming interviewer. */
export type MockInterviewHistoryTurn = { readonly role: string; readonly content: string }

/** Backend-proven payload and callbacks for one streamed interviewer turn. */
export type AskMockInterviewParams = {
    readonly sessionId: string
    readonly courseId: string
    readonly promptId: string
    readonly promptTitle: string
    readonly phase: string
    readonly history: ReadonlyArray<MockInterviewHistoryTurn>
    readonly latestAnswer: string
    readonly model?: string | null
    readonly provider?: string | null
    readonly level?: string
    readonly mode?: string | null
    readonly kind?: string | null
    readonly currentSeed?: string | null
    readonly questionIndex?: number | null
    readonly onDelta: (delta: string) => void
    readonly onDone: (error?: string) => void
}

type MockInterviewChunk = {
    readonly data?: {
        readonly streamId: string
        readonly delta?: string
        readonly done: boolean
        readonly error?: string
    }
}

type ActiveStream = Pick<AskMockInterviewParams, "onDelta" | "onDone"> & { readonly streamId: string }
/** Observable connection lifecycle of the mock-interview namespace. */
export type MockInterviewSocketState = "idle" | "connecting" | "connected" | "reconnecting" | "failed"

/** Connect to the authenticated interview namespace and own one active stream at a time. */
export const useMockInterviewSocketIo = () => {
    const token = useSessionToken()
    const locale = useLocale()
    const socketRef = useRef<Socket | null>(null)
    const activeRef = useRef<ActiveStream | null>(null)
    const [state, setState] = useState<MockInterviewSocketState>("idle")
    const [isStreaming, setIsStreaming] = useState(false)

    useEffect(() => {
        if (token === undefined) {
            setState("idle")
            return undefined
        }

        setState("connecting")
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
        const socket = io(`${baseUrl}${MOCK_INTERVIEW_NAMESPACE}`, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
        })
        socketRef.current = socket

        const onChunk = (message: MockInterviewChunk) => {
            const active = activeRef.current
            if (active === null || message.data?.streamId !== active.streamId) return
            if (message.data.delta !== undefined && message.data.delta.length > 0) active.onDelta(message.data.delta)
            if (!message.data.done) return
            active.onDone(message.data.error)
            activeRef.current = null
            setIsStreaming(false)
        }

        const onConnect = () => setState("connected")
        const onDisconnect = () => setState("reconnecting")
        const onConnectError = () => setState("reconnecting")
        const onReconnectAttempt = () => setState("reconnecting")
        const onReconnectFailed = () => setState("failed")

        socket.on("connect", onConnect)
        socket.on("disconnect", onDisconnect)
        socket.on("connect_error", onConnectError)
        socket.io.on("reconnect_attempt", onReconnectAttempt)
        socket.io.on("reconnect_failed", onReconnectFailed)
        socket.on(CHUNK_EVENT, onChunk)

        return () => {
            socket.off("connect", onConnect)
            socket.off("disconnect", onDisconnect)
            socket.off("connect_error", onConnectError)
            socket.io.off("reconnect_attempt", onReconnectAttempt)
            socket.io.off("reconnect_failed", onReconnectFailed)
            socket.off(CHUNK_EVENT, onChunk)
            activeRef.current?.onDone("SOCKET_DISCONNECTED")
            socket.disconnect()
            socketRef.current = null
            activeRef.current = null
            setIsStreaming(false)
        }
    }, [token])

    const ask = useCallback((params: AskMockInterviewParams) => {
        const socket = socketRef.current
        if (socket === null || !socket.connected) {
            params.onDone("SOCKET_DISCONNECTED")
            return
        }

        activeRef.current?.onDone("ABORTED")
        const streamId = crypto.randomUUID()
        activeRef.current = { streamId, onDelta: params.onDelta, onDone: params.onDone }
        setIsStreaming(true)
        socket.emit(ASK_EVENT, {
            locale,
            data: {
                streamId,
                sessionId: params.sessionId,
                courseId: params.courseId,
                promptId: params.promptId,
                promptTitle: params.promptTitle,
                phase: params.phase,
                history: params.history,
                latestAnswer: params.latestAnswer,
                model: params.model,
                provider: params.provider,
                level: params.level,
                mode: params.mode,
                kind: params.kind,
                currentSeed: params.currentSeed,
                questionIndex: params.questionIndex,
            },
        })
    }, [locale])

    const abort = useCallback(() => {
        const active = activeRef.current
        if (active === null) return
        socketRef.current?.emit(ABORT_EVENT, { locale, data: { streamId: active.streamId } })
        active.onDone("ABORTED")
        activeRef.current = null
        setIsStreaming(false)
    }, [locale])

    return { state, isConnected: state === "connected", isStreaming, ask, abort }
}
