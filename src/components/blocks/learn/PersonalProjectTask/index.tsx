"use client"

import { useEffect, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitPersonalTaskAttemptSwr } from "@/hooks/swr/useMutateSubmitPersonalTaskAttemptSwr"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import {
    isPersonalProjectEnrollmentDenied,
    useQueryPersonalProjectTaskWorkspaceSwr,
} from "@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { PersonalProjectTaskBase } from "./component"
import { PersonalProjectGradingSettingsDrawer } from "@/components/overlays/learn/PersonalProjectGradingSettingsDrawer"

/** Route identity required to resolve one personal-project task workspace. */
export type PersonalProjectTaskProps = { readonly displayId: string; readonly taskId: string }

const COPY = {
    en: {
        fallbackTitle: "Personal project task", fallbackDescription: "Complete this task to advance your personal project.",
        back: "Back to personal project", guidance: "Guidance", criteria: "Evaluation criteria", showCriteria: "Show criteria", hideCriteria: "Hide criteria",
        implementation: "Implementation notes", points: (score: number) => `${score} points`, submission: "Project GitHub",
        repository: "GitHub repository URL", repositoryDescription: "Paste the GitHub repository that contains your implementation.",
        repositoryPlaceholder: "https://github.com/owner/repository", settings: "Grading settings",
        language: "Language", model: "Grading model", branch: "Branch", branchPlaceholder: "main", token: "Private repository token",
        tokenPlaceholder: "Paste a new token", tokenStored: (last4: string) => `Stored token ending in ${last4}`,
        settingsSaved: "Grading settings saved.", evaluate: "Evaluate", feedback: "View feedback", history: "Attempt history",
        latest: "Latest grading", passed: "Passed", needsWork: "Needs another pass", saveSettings: "Save settings", retry: "Try again",
        lockedTitle: "Task is locked",
        invalidRepository: "Enter a valid HTTPS GitHub repository URL.", loadFailed: "This personal-project task could not be loaded.",
        locked: "Enroll in this course to unlock this personal-project task.",
        ancillaryFailed: "The task is ready, but repository or grading options are temporarily unavailable.",
        submitFailed: "The task could not be submitted. Try again.", settingsFailed: "The grading settings could not be saved.", auto: "Auto (recommended)",
    },
    vi: {
        fallbackTitle: "Bài tập đồ án cá nhân", // vn-ok: localized Vietnamese interface copy.
        fallbackDescription: "Hoàn thành bài này để tiếp tục đồ án cá nhân.", // vn-ok: localized Vietnamese interface copy.
        back: "Quay lại dự án cá nhân", // vn-ok: localized Vietnamese interface copy.
        guidance: "Hướng dẫn", // vn-ok: localized Vietnamese interface copy.
        criteria: "Tiêu chí đánh giá", // vn-ok: localized Vietnamese interface copy.
        showCriteria: "Xem tiêu chí", // vn-ok: localized Vietnamese interface copy.
        hideCriteria: "Thu gọn tiêu chí", // vn-ok: localized Vietnamese interface copy.
        implementation: "Hướng dẫn triển khai", // vn-ok: localized Vietnamese interface copy.
        points: (score: number) => `${score} điểm`, // vn-ok: localized Vietnamese interface copy.
        submission: "Project GitHub",
        repository: "URL GitHub repo",
        repositoryDescription: "Dán URL repo GitHub chứa phần triển khai của bạn.", // vn-ok: localized Vietnamese interface copy.
        repositoryPlaceholder: "https://github.com/owner/repository",
        settings: "Cài đặt chấm bài", // vn-ok: localized Vietnamese interface copy.
        language: "Ngôn ngữ", // vn-ok: localized Vietnamese interface copy.
        model: "Mô hình chấm", // vn-ok: localized Vietnamese interface copy.
        branch: "Branch",
        branchPlaceholder: "main",
        token: "Token repo riêng tư", // vn-ok: localized Vietnamese interface copy.
        tokenPlaceholder: "Dán token mới", // vn-ok: localized Vietnamese interface copy.
        tokenStored: (last4: string) => `Đã lưu token kết thúc bằng ${last4}`, // vn-ok: localized Vietnamese interface copy.
        settingsSaved: "Đã lưu cài đặt chấm bài.", // vn-ok: localized Vietnamese interface copy.
        evaluate: "Đánh giá", // vn-ok: localized Vietnamese interface copy.
        feedback: "Xem phản hồi", // vn-ok: localized Vietnamese interface copy.
        history: "Lịch sử chấm bài", // vn-ok: localized Vietnamese interface copy.
        latest: "Kết quả gần nhất", // vn-ok: localized Vietnamese interface copy.
        passed: "Đạt", // vn-ok: localized Vietnamese interface copy.
        needsWork: "Cần làm lại", // vn-ok: localized Vietnamese interface copy.
        saveSettings: "Lưu cài đặt", // vn-ok: localized Vietnamese interface copy.
        retry: "Thử lại", // vn-ok: localized Vietnamese interface copy.
        lockedTitle: "Bài tập đang bị khóa", // vn-ok: localized Vietnamese interface copy.
        invalidRepository: "Nhập URL GitHub HTTPS hợp lệ.", // vn-ok: localized Vietnamese interface copy.
        loadFailed: "Không thể tải bài tập đồ án cá nhân này.", // vn-ok: localized Vietnamese interface copy.
        locked: "Bạn cần đăng ký khóa học để mở bài tập đồ án cá nhân này.", // vn-ok: localized Vietnamese interface copy.
        ancillaryFailed: "Bài tập đã sẵn sàng, nhưng repository hoặc lựa chọn chấm bài đang tạm thời gián đoạn.", // vn-ok: localized Vietnamese interface copy.
        submitFailed: "Không thể nộp bài. Hãy thử lại.", // vn-ok: localized Vietnamese interface copy.
        settingsFailed: "Không thể lưu cài đặt chấm bài.", // vn-ok: localized Vietnamese interface copy.
        auto: "Tự động (khuyên dùng)", // vn-ok: localized Vietnamese interface copy.
    },
} as const

const isGithubRepository = (value: string) => /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/u.test(value.trim())

/** Resolves real task/settings data, persists grading choices and opens the result route. */
export const PersonalProjectTask = (props: PersonalProjectTaskProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(props.displayId)
    const courseId = project.data?.course.id
    const workspace = useQueryPersonalProjectTaskWorkspaceSwr(courseId, props.taskId)
    const attempts = useQueryPersonalTaskAttemptsSwr(courseId, props.taskId)
    const submission = useMutateSubmitPersonalTaskAttemptSwr()
    const [repository, setRepository] = useState("")
    const [repositoryTouched, setRepositoryTouched] = useState(false)
    const [expandedBriefSectionIds, setExpandedBriefSectionIds] = useState<ReadonlyArray<string>>([])
    const [settingsOpen, setSettingsOpen] = useState(false)

    useEffect(() => {
        const data = workspace.data
        if (data === undefined) return
        setRepository((value) => value === "" ? (data.repository.githubUrl ?? "") : value)
    }, [workspace.data])

    const task = workspace.data?.task
    const roadmapTask = project.data?.milestones
        .flatMap((milestone) => milestone.tasks)
        .find((item) => item.id === props.taskId)
    const selectedLanguage = task?.briefs[0]?.lang ?? task?.codeImplementations[0]?.lang ?? "agnostic"
    const brief = task?.briefs.find((item) => item.lang === selectedLanguage)?.body
        ?? task?.briefs[0]?.body
        ?? task?.description
    const implementationRow = task?.codeImplementations.find((item) => item.lang === selectedLanguage)
        ?? task?.codeImplementations[0]
    const implementation = implementationRow === undefined
        ? undefined
        : [implementationRow.guide, implementationRow.example].filter(Boolean).join("\n\n")
    const repositoryInvalid = repositoryTouched && !isGithubRepository(repository)
    const enrollmentDenied = isPersonalProjectEnrollmentDenied(project.error)
        || isPersonalProjectEnrollmentDenied(workspace.error)
    const taskFailed = !enrollmentDenied && (project.error !== undefined || workspace.error !== undefined)
    const pending = project.data === undefined || (courseId !== undefined && workspace.data === undefined && workspace.error === undefined)
    const state = enrollmentDenied
        ? "forbidden"
        : taskFailed
            ? "task-error"
            : pending
                ? "pending"
                : submission.isMutating
                    ? "submitting"
                    : submission.error !== undefined
                        ? "submission-error"
                        : workspace.data?.ancillaryUnavailable === true
                            ? "ancillary-unavailable"
                            : repositoryInvalid
                                ? "invalid-repository"
                                : attempts.data?.data?.[0] === undefined
                                    ? "ready"
                                    : "latest-result"
    const notice = repositoryInvalid
        ? copy.invalidRepository
        : submission.error !== undefined
            ? copy.submitFailed
            : enrollmentDenied
                ? copy.locked
                : taskFailed
                    ? copy.loadFailed
                    : workspace.data?.ancillaryUnavailable === true
                        ? copy.ancillaryFailed
                        : undefined

    const submit = async () => {
        if (courseId === undefined) return
        setRepositoryTouched(true)
        if (!isGithubRepository(repository)) return
        try {
            await submission.trigger({
                courseId,
                taskId: props.taskId,
                githubUrl: repository,
                branch: workspace.data?.repository.branch ?? null,
                lang: selectedLanguage === "agnostic" ? undefined : selectedLanguage,
            })
            await Promise.all([project.mutate(), workspace.mutate(), attempts.mutate()])
            router.push(`/courses/${props.displayId}/learn/personal-project/tasks/${props.taskId}/result`)
        } catch {
            // Mutation hooks retain the backend error for the pure state mapper.
        }
    }
    return <PersonalProjectTaskBase
        state={state}
        props={{
            title: task?.title ?? roadmapTask?.title ?? copy.fallbackTitle,
            description: task?.description ?? copy.fallbackDescription,
            difficulty: task?.difficulty ?? undefined,
            maxScore: task?.maxScore ?? roadmapTask?.maxScore ?? 0,
            brief,
            hint: task?.hint,
            criteria: (task?.criterias ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex),
            expandedBriefSectionIds,
            implementation,
            repositoryUrl: workspace.data?.repository.githubUrl ?? undefined,
            repositoryDraft: repository,
            repositoryState: repositoryInvalid ? "invalid" : "ready",
            latestAttempt: attempts.data?.data?.[0],
            notice,
            labels: copy,
        }}
        on={{
            back: () => router.push(`/courses/${props.displayId}/learn/personal-project`),
            toggleBriefSection: (id, isOpen) => setExpandedBriefSectionIds((current) => isOpen
                ? current.includes(id) ? current : [...current, id]
                : current.filter((value) => value !== id)),
            changeRepository: (value) => { setRepository(value); setRepositoryTouched(true) },
            openSettings: () => setSettingsOpen(true),
            submit: () => { void submit() },
            retry: () => {
                if (state === "submission-error") void submit()
                else void Promise.all([project.mutate(), workspace.mutate()])
            },
            openFeedback: () => router.push(`/courses/${props.displayId}/learn/personal-project/tasks/${props.taskId}/result`),
            openHistory: () => router.push(`/courses/${props.displayId}/learn/personal-project/tasks/${props.taskId}/result?history=1`),
        }}
        settingsOverlay={PersonalProjectGradingSettingsDrawer}
        settingsOverlayProps={courseId === undefined ? undefined : { courseId, taskId: props.taskId, isOpen: settingsOpen && state !== "forbidden", onDismiss: () => setSettingsOpen(false) }}
    />
}
