"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSessionRefresh } from "@/hooks/auth/useSessionRefresh"
import { useQueryCourseSwr } from "@/hooks/swr/useQueryCourseSwr"
import { useQueryMockInterviewAttemptBySessionSwr } from "@/hooks/swr/useQueryMockInterviewAttemptBySessionSwr"
import { useQueryMyInProgressMockInterviewSessionSwr } from "@/hooks/swr/useQueryMyInProgressMockInterviewSessionSwr"
import {
    useMutateAbandonMockInterviewSessionSwr,
    useMutateCompleteMockInterviewSessionSwr,
} from "@/hooks/swr/useMutateMockInterviewSessionLifecycleSwr"
import { useMutateSyncMockInterviewSessionTurnsSwr } from "@/hooks/swr/useMutateSyncMockInterviewSessionTurnsSwr"
import { useMockInterviewSocketIo } from "@/hooks/socketio/useMockInterviewSocketIo"
import type { MockInterviewTurn } from "@/modules/api/graphql/queries/query-my-in-progress-mock-interview-session"
import { CourseMockInterviewSessionBlockBase, type CourseMockInterviewSessionState } from "./component"

/** Route identity required to restore one durable interview room. */
export type CourseMockInterviewSessionPageProps = {
    readonly displayId: string
    readonly sessionId: string
}

const PHASES = ["requirements", "estimation", "highLevel", "deepDive", "tradeoffs"] as const

type InterviewStateInputs = {
    loadFailed: boolean
    pending: boolean
    session: unknown
    hydrated: boolean
    expired: boolean
    missing: boolean
    syncing: boolean
    grading: boolean
}

const resolveInterviewState = (input: InterviewStateInputs): CourseMockInterviewSessionState => {
    if (input.loadFailed) return "failed"
    if (input.pending || (input.session !== null && input.hydrated)) return "connecting"
    if (input.expired || input.missing) return "expired"
    if (input.syncing || input.grading) return "syncing"
    return "live"
}

type InterviewStateCopy = { connecting: string; reconnecting: string; syncing: string; grading: string; expired: string; failed: string }

const resolveInterviewStateLabel = (state: CourseMockInterviewSessionState, copy: InterviewStateCopy, promptTitle: string | undefined, grading: boolean, syncing: boolean, socketState: string): string => {
    if (grading) return copy.grading
    if (syncing) return copy.syncing
    if (socketState === "reconnecting" || socketState === "failed") return copy.reconnecting
    if (state === "connecting") return copy.connecting
    if (state === "expired") return copy.expired
    if (state === "failed") return copy.failed
    return promptTitle ?? copy.connecting
}

const COPY = {
    en: {
        title: "Mock interview",
        connecting: "Connecting to your interview…",
        reconnecting: "Connection lost. Reconnecting without discarding your transcript…",
        syncing: "Saving your transcript…",
        grading: "Handing your completed answers to the grading queue…",
        expired: "This session reached its deadline. Finish now to grade the answers already saved.",
        failed: "The interview could not be restored.",
        interviewer: "Interviewer",
        candidate: "Your answer",
        pending: "The interviewer will place the next question here.",
        answer: "Your response",
        placeholder: "Answer as you would in a real interview…",
        submit: "Answer and continue",
        finish: "Finish and grade",
        abort: "Stop response",
        leave: "Leave interview",
        abandon: "Discard interview",
        keepInterview: "Keep interviewing",
        finishTitle: "Finish and submit this interview?",
        finishDescription: "Your saved answers will be locked and sent to the grading queue.",
        abandonTitle: "Discard this interview?",
        abandonDescription: "This unfinished session will be closed and cannot be resumed.",
        saved: "Answers saved",
        saving: "Saving answers…",
        conflict: "A newer saved version was found. The room has been restored to the server copy.",
        retry: "Try again",
        workspace: "Question workspace",
        workspaceEmpty: "No code or reference material is attached to this question.",
        turns: "Completed turns",
        turnsEmpty: "Your completed answers will collect here as the interview progresses.",
        progress: "Interview progress",
        remaining: (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")} remaining`,
        counter: (current: number, total: number) => `${current}/${total}`,
    },
    vi: {
        title: "Phỏng vấn thử", // vn-ok: approved Vietnamese runtime copy
        connecting: "Đang kết nối tới buổi phỏng vấn…", // vn-ok: approved Vietnamese runtime copy
        reconnecting: "Mất kết nối. Đang kết nối lại mà không làm mất bản ghi…", // vn-ok: approved Vietnamese runtime copy
        syncing: "Đang lưu bản ghi phỏng vấn…", // vn-ok: approved Vietnamese runtime copy
        grading: "Đang chuyển các câu trả lời đã hoàn thành sang hàng đợi chấm điểm…", // vn-ok: approved Vietnamese runtime copy
        expired: "Phiên đã hết hạn. Hãy kết thúc để chấm những câu trả lời đã được lưu.", // vn-ok: approved Vietnamese runtime copy
        failed: "Không thể khôi phục buổi phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        interviewer: "Người phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        candidate: "Câu trả lời của bạn", // vn-ok: approved Vietnamese runtime copy
        pending: "Câu hỏi tiếp theo sẽ xuất hiện tại đây.", // vn-ok: approved Vietnamese runtime copy
        answer: "Câu trả lời của bạn", // vn-ok: approved Vietnamese runtime copy
        placeholder: "Trả lời như trong một buổi phỏng vấn thật…", // vn-ok: approved Vietnamese runtime copy
        submit: "Trả lời và tiếp tục", // vn-ok: approved Vietnamese runtime copy
        finish: "Kết thúc và chấm điểm", // vn-ok: approved Vietnamese runtime copy
        abort: "Dừng phản hồi", // vn-ok: approved Vietnamese runtime copy
        leave: "Rời buổi phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        abandon: "Hủy phiên phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        keepInterview: "Tiếp tục phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        finishTitle: "Kết thúc và nộp buổi phỏng vấn?", // vn-ok: approved Vietnamese runtime copy
        finishDescription: "Các câu trả lời đã lưu sẽ được khóa và chuyển sang hàng đợi chấm điểm.", // vn-ok: approved Vietnamese runtime copy
        abandonTitle: "Hủy phiên phỏng vấn này?", // vn-ok: approved Vietnamese runtime copy
        abandonDescription: "Phiên chưa hoàn thành sẽ được đóng và không thể tiếp tục lại.", // vn-ok: approved Vietnamese runtime copy
        saved: "Đã lưu câu trả lời", // vn-ok: approved Vietnamese runtime copy
        saving: "Đang lưu câu trả lời…", // vn-ok: approved Vietnamese runtime copy
        conflict: "Phát hiện bản lưu mới hơn. Phòng phỏng vấn đã khôi phục theo dữ liệu máy chủ.", // vn-ok: approved Vietnamese runtime copy
        retry: "Thử lại", // vn-ok: approved Vietnamese runtime copy
        workspace: "Không gian câu hỏi", // vn-ok: approved Vietnamese runtime copy
        workspaceEmpty: "Câu hỏi này không có mã nguồn hoặc tài liệu tham chiếu đính kèm.", // vn-ok: approved Vietnamese runtime copy
        turns: "Các lượt đã hoàn thành", // vn-ok: approved Vietnamese runtime copy
        turnsEmpty: "Các câu trả lời đã hoàn thành sẽ được lưu tại đây trong suốt buổi phỏng vấn.", // vn-ok: approved Vietnamese runtime copy
        progress: "Tiến độ phỏng vấn", // vn-ok: approved Vietnamese runtime copy
        remaining: (seconds: number) => `Còn ${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`, // vn-ok: approved Vietnamese runtime copy
        counter: (current: number, total: number) => `${current}/${total}`,
    },
} as const

/** Rehydrate, persist and grade one durable mock-interview session. */
export const CourseMockInterviewSessionBlock = ({ displayId, sessionId }: CourseMockInterviewSessionPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const sessionRefresh = useSessionRefresh()
    const course = useQueryCourseSwr({ displayId })
    const courseId = course.data?.isEnrolled === true ? course.data.id : undefined
    const inProgress = useQueryMyInProgressMockInterviewSessionSwr(courseId)
    const attempt = useQueryMockInterviewAttemptBySessionSwr(courseId, sessionId)
    const sync = useMutateSyncMockInterviewSessionTurnsSwr(courseId, sessionId)
    const complete = useMutateCompleteMockInterviewSessionSwr(courseId, sessionId)
    const abandon = useMutateAbandonMockInterviewSessionSwr(courseId, sessionId)
    const socket = useMockInterviewSocketIo()
    const [turns, setTurns] = useState<ReadonlyArray<MockInterviewTurn>>([])
    const [questionIndex, setQuestionIndex] = useState(0)
    const [phaseIndex, setPhaseIndex] = useState(0)
    const [revision, setRevision] = useState(0)
    const [answer, setAnswer] = useState("")
    const [streamingText, setStreamingText] = useState<string | undefined>(undefined)
    const streamingRef = useRef("")
    const [runtimeError, setRuntimeError] = useState<string | undefined>(undefined)
    const [finishConfirmationOpen, setFinishConfirmationOpen] = useState(false)
    const [abandonConfirmationOpen, setAbandonConfirmationOpen] = useState(false)
    const [hydratedSessionId, setHydratedSessionId] = useState<string | undefined>(undefined)
    const [now, setNow] = useState(() => Date.now())
    const openingRequestedRef = useRef(false)
    const autoGradeRequestedRef = useRef(false)
    const lastSyncedRef = useRef("")
    const revisionRef = useRef(0)

    const session = inProgress.data?.sessionId === sessionId ? inProgress.data : null
    const isDesign = session?.mode === "design"
    const total = isDesign ? PHASES.length : Math.max(session?.seedQuestions.length ?? 0, 1)
    const current = isDesign ? phaseIndex : questionIndex
    const phase = PHASES[Math.min(phaseIndex, PHASES.length - 1)]
    const deadlineMs = session === null ? Number.NaN : new Date(session.deadlineAt).getTime()
    const remainingSeconds = Number.isFinite(deadlineMs) ? Math.max(0, Math.ceil((deadlineMs - now) / 1000)) : undefined
    const expired = remainingSeconds === 0

    const setupPath = `/courses/${displayId}/learn/mock-interview`
    const resultPath = `${setupPath}/interview/${sessionId}/result`

    useEffect(() => {
        if (sessionRefresh.isRestoring || course.data === undefined || course.data === null || course.data.isEnrolled === true) return
        router.replace(setupPath)
    }, [course.data, router, sessionRefresh.isRestoring, setupPath])

    useEffect(() => {
        if (session === null || hydratedSessionId === sessionId) return
        const restoredTurns = session.turns ?? []
        setTurns(restoredTurns)
        setQuestionIndex(session.questionIndex)
        setPhaseIndex(session.phaseIndex)
        setRevision(session.revision)
        revisionRef.current = session.revision
        lastSyncedRef.current = JSON.stringify(restoredTurns)
        setHydratedSessionId(sessionId)
        setRuntimeError(undefined)
    }, [hydratedSessionId, session, sessionId])

    useEffect(() => {
        if (remainingSeconds === undefined || remainingSeconds === 0) return undefined
        const timer = window.setInterval(() => setNow(Date.now()), 1000)
        return () => window.clearInterval(timer)
    }, [remainingSeconds])

    useEffect(() => {
        if (courseId === undefined || inProgress.data === undefined || attempt.data === undefined) return
        if (session?.status === "grading" || session?.status === "grading_failed") {
            router.replace(resultPath)
            return
        }
        if (session === null && attempt.data !== null) router.replace(resultPath)
    }, [attempt.data, courseId, inProgress.data, resultPath, router, session])

    const askQuestion = useCallback((nextIndex: number, history: ReadonlyArray<MockInterviewTurn>, latestAnswer = "") => {
        if (session === null || courseId === undefined) return
        const seed = isDesign ? undefined : session.seedQuestions[nextIndex]
        const nextPhase = isDesign ? PHASES[Math.min(nextIndex, PHASES.length - 1)] : phase
        if (!isDesign && session.source === "interview-bank") {
            if (seed === undefined) return
            setTurns([...history, { role: "interviewer", phase: nextPhase, content: seed.title, questionIndex: nextIndex }])
            return
        }
        streamingRef.current = ""
        setStreamingText("")
        socket.ask({
            sessionId,
            courseId,
            promptId: session.promptId,
            promptTitle: session.promptTitle,
            phase: nextPhase,
            history: history.map((turn) => ({ role: turn.role, content: turn.content })),
            latestAnswer,
            level: session.level ?? undefined,
            mode: session.mode,
            kind: seed?.kind,
            currentSeed: seed?.title,
            questionIndex: isDesign ? null : nextIndex,
            onDelta: (delta) => {
                streamingRef.current += delta
                setStreamingText(streamingRef.current)
            },
            onDone: (error) => {
                const completed = streamingRef.current.trim()
                setStreamingText(undefined)
                if (error === "ABORTED") return
                if (error === "SESSION_EXPIRED") {
                    setNow(deadlineMs)
                    return
                }
                if (error !== undefined) {
                    setRuntimeError(error)
                    return
                }
                if (completed.length > 0) {
                    setTurns((previous) => [...previous, {
                        role: "interviewer",
                        phase: nextPhase,
                        content: completed,
                        questionIndex: isDesign ? undefined : nextIndex,
                    }])
                }
            },
        })
    }, [courseId, deadlineMs, isDesign, phase, session, sessionId, socket])

    useEffect(() => {
        if (hydratedSessionId !== sessionId || session === null || turns.length > 0 || openingRequestedRef.current || expired) return
        if (session.source !== "interview-bank" && !socket.isConnected) return
        openingRequestedRef.current = true
        askQuestion(current, [], "")
    }, [askQuestion, current, expired, hydratedSessionId, session, sessionId, socket.isConnected, turns.length])

    const persistSnapshot = useCallback(async (
        nextTurns: ReadonlyArray<MockInterviewTurn>,
        nextQuestionIndex: number,
        nextPhaseIndex: number,
    ) => {
        const response = await sync.trigger({
            sessionId,
            expectedRevision: revisionRef.current,
            turns: nextTurns,
            questionIndex: nextQuestionIndex,
            phaseIndex: nextPhaseIndex,
        })
        const envelope = response.data?.syncMockInterviewSessionTurns
        const snapshot = envelope?.data
        if (envelope?.success !== true || snapshot === null || snapshot === undefined) {
            throw new Error(envelope?.message ?? envelope?.error ?? "SYNC_FAILED")
        }
        revisionRef.current = snapshot.revision
        setRevision(snapshot.revision)
        if (snapshot.conflict) {
            setTurns(snapshot.turns)
            setQuestionIndex(snapshot.questionIndex)
            setPhaseIndex(snapshot.phaseIndex)
            lastSyncedRef.current = JSON.stringify(snapshot.turns)
            setRuntimeError(copy.conflict)
        }
        return snapshot.revision
    }, [copy.conflict, sessionId, sync])

    useEffect(() => {
        if (hydratedSessionId !== sessionId || turns.length === 0) return
        const fingerprint = JSON.stringify(turns)
        if (fingerprint === lastSyncedRef.current) return
        lastSyncedRef.current = fingerprint
        void persistSnapshot(turns, questionIndex, phaseIndex).catch(() => setRuntimeError("SYNC_FAILED"))
    }, [hydratedSessionId, persistSnapshot, phaseIndex, questionIndex, sessionId, turns])

    const finish = useCallback(async (completedTurns: ReadonlyArray<MockInterviewTurn> = turns) => {
        if (session === null || courseId === undefined || complete.isMutating || socket.isStreaming) return
        setRuntimeError(undefined)
        try {
            const synchronizedRevision = await persistSnapshot(completedTurns, questionIndex, phaseIndex)
            const response = await complete.trigger({
                courseId,
                sessionId,
                expectedRevision: synchronizedRevision,
            })
            const payload = response.data?.completeMockInterviewSession
            if (payload?.success !== true || payload.data === null || payload.data === undefined) {
                setRuntimeError(payload?.message ?? payload?.error ?? "COMPLETE_FAILED")
                await inProgress.mutate()
                return
            }
            revisionRef.current = payload.data.revision
            setRevision(payload.data.revision)
            router.replace(resultPath)
        } catch {
            setRuntimeError("COMPLETE_FAILED")
            await inProgress.mutate()
        }
    }, [complete, courseId, inProgress, persistSnapshot, phaseIndex, questionIndex, resultPath, router, session, sessionId, socket.isStreaming, turns])

    const abandonSession = useCallback(async () => {
        if (courseId === undefined || abandon.isMutating) return
        setRuntimeError(undefined)
        try {
            const response = await abandon.trigger({ courseId, sessionId, expectedRevision: revisionRef.current })
            const payload = response.data?.abandonMockInterviewSession
            if (payload?.success !== true || payload.data === null || payload.data === undefined) {
                setRuntimeError(payload?.message ?? payload?.error ?? "ABANDON_FAILED")
                await inProgress.mutate()
                return
            }
            router.replace(setupPath)
        } catch {
            setRuntimeError("ABANDON_FAILED")
            await inProgress.mutate()
        }
    }, [abandon, courseId, inProgress, router, sessionId, setupPath])

    useEffect(() => {
        if (!expired || session === null || hydratedSessionId !== sessionId || autoGradeRequestedRef.current) return
        autoGradeRequestedRef.current = true
        socket.abort()
        setFinishConfirmationOpen(true)
    }, [expired, hydratedSessionId, session, sessionId, socket])

    const submit = () => {
        const content = answer.trim()
        if (content.length === 0 || session === null || socket.isStreaming || expired) return
        const nextTurns: ReadonlyArray<MockInterviewTurn> = [...turns, {
            role: "candidate",
            phase,
            content,
            questionIndex: isDesign ? undefined : questionIndex,
        }]
        setTurns(nextTurns)
        setAnswer("")
        if (current >= total - 1) {
            setFinishConfirmationOpen(true)
            return
        }
        const next = current + 1
        if (isDesign) setPhaseIndex(next)
        else setQuestionIndex(next)
        askQuestion(next, nextTurns, isDesign ? content : "")
    }

    const accessDenied = !sessionRefresh.isRestoring && course.data !== undefined && course.data !== null && course.data.isEnrolled !== true
    const loadFailed = accessDenied || course.error !== undefined || (courseId !== undefined && (inProgress.error !== undefined || attempt.error !== undefined)) || course.data === null
    const pending = !loadFailed && (sessionRefresh.isRestoring || course.data === undefined || (courseId !== undefined && (inProgress.data === undefined || attempt.data === undefined)))
    const missing = !pending && session === null && attempt.data === null
    const state = resolveInterviewState({
        loadFailed, pending, session, hydrated: hydratedSessionId !== sessionId,
        expired, missing, syncing: sync.isMutating, grading: complete.isMutating,
    })
    const stateLabel = resolveInterviewStateLabel(state, copy, session?.promptTitle, complete.isMutating, sync.isMutating, socket.state)
    const activeSeed = isDesign ? undefined : session?.seedQuestions[questionIndex]

    return (
        <CourseMockInterviewSessionBlockBase
            state={state}
            props={{
                operation: complete.isMutating ? "grading" : sync.isMutating ? "syncing" : socket.isStreaming ? "streaming" : undefined,
                title: copy.title,
                promptTitle: session?.promptTitle ?? copy.title,
                stateLabel,
                counterLabel: copy.counter(Math.min(current + 1, total), total),
                progressLabel: copy.progress,
                progress: total === 0 ? 0 : Math.min(100, ((current + 1) / total) * 100),
                remainingLabel: remainingSeconds === undefined ? undefined : copy.remaining(remainingSeconds),
                turns: turns.map((turn, index) => ({
                    id: `${index}-${turn.role}-${turn.questionIndex ?? turn.phase}`,
                    role: turn.role === "candidate" ? "candidate" : "interviewer",
                    label: turn.role === "candidate" ? copy.candidate : copy.interviewer,
                    content: turn.content,
                })),
                streamingText,
                interviewerPendingLabel: copy.pending,
                answerLabel: copy.answer,
                answerPlaceholder: copy.placeholder,
                answer,
                submitLabel: copy.submit,
                abortLabel: copy.abort,
                leaveLabel: copy.leave,
                finishLabel: copy.finish,
                retryLabel: copy.retry,
                workspaceLabel: copy.workspace,
                workspaceEmptyLabel: copy.workspaceEmpty,
                turnsLabel: copy.turns,
                turnsEmptyLabel: copy.turnsEmpty,
                workspaceCode: activeSeed?.givenCodes[0]?.code,
                notice: runtimeError,
                syncStatusLabel: sync.isMutating ? copy.saving : copy.saved,
                finishConfirmationOpen,
                finishConfirmationTitle: copy.finishTitle,
                finishConfirmationDescription: copy.finishDescription,
                abandonConfirmationOpen,
                abandonConfirmationTitle: copy.abandonTitle,
                abandonConfirmationDescription: copy.abandonDescription,
                confirmLabel: copy.finish,
                abandonLabel: copy.abandon,
                cancelLabel: copy.keepInterview,
                revisionLabel: `v${revision}`,
            }}
            on={{
                answer: setAnswer,
                ask: submit,
                abort: socket.abort,
                leave: () => setAbandonConfirmationOpen(true),
                finish: () => setFinishConfirmationOpen(true),
                dismissConfirmation: () => {
                    setFinishConfirmationOpen(false)
                    setAbandonConfirmationOpen(false)
                },
                confirmFinish: () => {
                    setFinishConfirmationOpen(false)
                    void finish()
                },
                confirmAbandon: () => {
                    setAbandonConfirmationOpen(false)
                    void abandonSession()
                },
                retry: () => {
                    setRuntimeError(undefined)
                    void Promise.all([course.mutate(), inProgress.mutate(), attempt.mutate()])
                },
            }}
        />
    )
}

/** Source-level ownership marker for the connected session twin. */
export const meta = { world: "connected", domain: "learn" } as const
