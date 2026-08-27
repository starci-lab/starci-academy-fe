"use client"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useSessionToken } from "../auth/useSessionToken"

/**
 * The verdict of one judging job, as it arrives.
 *
 * IT EXISTS BECAUSE JUDGING IS ASYNCHRONOUS. `submitCodingSolution` returns a `submissionId` and a
 * `jobId` and nothing else - the server's own field description says the job is what a client
 * subscribes to over Socket.IO for the verdict. A page written as though the mutation answers the
 * question waits forever.
 *
 * THE LOST CONNECTION IS A STATE, NOT AN ERROR. Judging carries on server-side while the client is
 * deaf, so `isConnected: false` while a job is pending means "we stopped hearing", never "it
 * failed". The surface says so and offers a re-read rather than a resubmit, because resubmitting
 * would enqueue a second judging of work already done.
 */

/** What a job status message carries. */
export interface JobVerdict {
    /** The job this is about. */
    jobId: string
    /** The verdict name, one of the server's nine. */
    verdict?: string
    /** Testcases passed so far. */
    passedTestcases?: number
    /** Total testcases evaluated. */
    totalTestcases?: number
    /** Compiler stderr, present only for a compile error. */
    compileMessage?: string
    /** Generic async-job status published by the job-notifications gateway. */
    status?: string
    /** Product bucket for the owning job. */
    category?: string
    /** Challenge deliverable associated with this job, when applicable. */
    challengeSubmissionId?: string
    /** Terminal failure detail, when the worker exposes one. */
    error?: string
    /** Sanitized terminal failure detail emitted by the generic job gateway. */
    failureReason?: string | null
}

/** Connection lifecycle exposed to product surfaces. */
export type JobNotificationConnectionState = "idle" | "connecting" | "connected" | "disconnected"

/** Server envelope emitted by the job-notifications namespace. */
interface JobStatusEnvelope {
    readonly data?: JobVerdict
}

/** The namespace the API publishes job status on. */
const JOB_NOTIFICATIONS_NAMESPACE = "/job_notifications"

/** The event a job status arrives as. */
const SUBSCRIBE_JOB_EVENT = "job_notifications.subscribe_job_notification.publication"
const JOB_STATUS_EVENT = "job_notifications.job_status_updated.subscription"

/**
 * Subscribe to one judging job.
 *
 * Pass `undefined` to subscribe to nothing - that is the resting state before the first submission,
 * and it opens no socket at all rather than opening one and ignoring it.
 */
export const useJobVerdictSocketIo = (jobId?: string) => {
    const token = useSessionToken()
    const [verdict, setVerdict] = useState<JobVerdict | undefined>(undefined)
    const [isConnected, setIsConnected] = useState(false)
    const [connectionState, setConnectionState] = useState<JobNotificationConnectionState>("idle")
    const socketRef = useRef<Socket | undefined>(undefined)

    useEffect(() => {
        if (jobId === undefined || token === undefined) return undefined

        setConnectionState("connecting")
        const url = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"
        const socket = io(`${url}${JOB_NOTIFICATIONS_NAMESPACE}`, {
            auth: { token },
            transports: ["websocket"],
        })
        socketRef.current = socket

        const subscribe = () => {
            setIsConnected(true)
            setConnectionState("connected")
            socket.emit(SUBSCRIBE_JOB_EVENT, {
                data: { jobId },
                locale: document.documentElement.lang || "en",
            })
        }
        const disconnect = () => {
            setIsConnected(false)
            setConnectionState("disconnected")
        }
        const receive = (message: JobStatusEnvelope) => {
            const update = message.data
            // one socket may carry every job this viewer owns, so a message for somebody else's
            // submission must not overwrite the verdict this page is waiting on
            if (update?.jobId === jobId) setVerdict(update)
        }
        socket.on("connect", subscribe)
        socket.on("disconnect", disconnect)
        socket.on("connect_error", disconnect)
        socket.on(JOB_STATUS_EVENT, receive)

        return () => {
            socket.off("connect", subscribe)
            socket.off("disconnect", disconnect)
            socket.off("connect_error", disconnect)
            socket.off(JOB_STATUS_EVENT, receive)
            socket.disconnect()
            socketRef.current = undefined
            setIsConnected(false)
            setConnectionState("idle")
        }
    }, [jobId, token])

    return { verdict, isConnected, connectionState }
}
