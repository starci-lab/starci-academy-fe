"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { io, type Socket } from "socket.io-client"
import { useSessionToken } from "../auth/useSessionToken"
import type {
    AbortContentAiStreamMessage,
    AskContentAiStreamMessage,
    AskContentAiStreamParams,
    ContentAiSocketState,
    ContentAiStreamChunkMessage,
} from "./types/content-ai"
import type { CourseAdvisorMetadata } from "@/modules/ai/course-advisor-response"

const CONTENT_AI_NAMESPACE = "/content_ai"
const ASK_EVENT = "content_ai.ask.publication"
const ABORT_EVENT = "content_ai.abort.publication"
const CHUNK_EVENT = "content_ai.chunk.subscription"

type ActiveStream = Pick<AskContentAiStreamParams, "onDelta" | "onDone"> & {
    readonly streamId: string
}

/** Owns one authenticated content-AI stream and forwards backend terminal errors unchanged. */
export const useContentAiStream = () => {
    const token = useSessionToken()
    const locale = useLocale()
    const socketRef = useRef<Socket | null>(null)
    const activeRef = useRef<ActiveStream | null>(null)
    const [state, setState] = useState<ContentAiSocketState>("idle")
    const [isStreaming, setIsStreaming] = useState(false)

    useEffect(() => {
        if (token === undefined) {
            setState("idle")
            return undefined
        }

        setState("connecting")
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
        const socket = io(`${baseUrl}${CONTENT_AI_NAMESPACE}`, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
        })
        socketRef.current = socket

        const finishActive = (error?: string, courseAdvisor?: CourseAdvisorMetadata) => {
            const active = activeRef.current
            if (active === null) return
            if (courseAdvisor === undefined) active.onDone(error)
            else active.onDone(error, courseAdvisor)
            activeRef.current = null
            setIsStreaming(false)
        }
        const onChunk = (message: ContentAiStreamChunkMessage) => {
            const active = activeRef.current
            const chunk = message.data
            if (active === null || chunk === undefined || chunk.streamId !== active.streamId) return
            if (chunk.delta.length > 0) active.onDelta(chunk.delta)
            if (chunk.done) finishActive(chunk.error, chunk.courseAdvisor)
        }
        const onConnect = () => setState("connected")
        const onDisconnect = () => {
            setState("reconnecting")
            finishActive("SOCKET_DISCONNECTED")
        }
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
            finishActive("SOCKET_DISCONNECTED")
            socket.disconnect()
            socketRef.current = null
        }
    }, [token])

    const ask = useCallback((params: AskContentAiStreamParams) => {
        const socket = socketRef.current
        if (socket === null || !socket.connected) {
            params.onDone("SOCKET_DISCONNECTED")
            return
        }

        const previous = activeRef.current
        if (previous !== null) {
            const abortPrevious: AbortContentAiStreamMessage = {
                locale,
                data: { streamId: previous.streamId },
            }
            socket.emit(ABORT_EVENT, abortPrevious)
            previous.onDone("ABORTED")
        }

        const streamId = crypto.randomUUID()
        activeRef.current = { streamId, onDelta: params.onDelta, onDone: params.onDone }
        setIsStreaming(true)
        const message: AskContentAiStreamMessage = {
            locale,
            data: {
                streamId,
                sessionId: params.sessionId,
                contentId: params.contentId,
                taskId: params.taskId,
                challengeId: params.challengeId,
                quizId: params.quizId,
                foundationId: params.foundationId,
                courseId: params.courseId,
                question: params.question,
                history: params.history,
                model: params.model,
                provider: params.provider,
                experience: params.experience,
            },
        }
        socket.emit(ASK_EVENT, message)
    }, [locale])

    const abort = useCallback(() => {
        const active = activeRef.current
        if (active === null) return
        const message: AbortContentAiStreamMessage = {
            locale,
            data: { streamId: active.streamId },
        }
        socketRef.current?.emit(ABORT_EVENT, message)
        active.onDone("ABORTED")
        activeRef.current = null
        setIsStreaming(false)
    }, [locale])

    return { state, isConnected: state === "connected", isStreaming, ask, abort }
}
