"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useMutateSubmitPersonalTaskAttemptSwr } from "@/hooks/swr/useMutateSubmitPersonalTaskAttemptSwr"
import { useMutateSyncPersonalProjectGithubSwr } from "@/hooks/swr/useMutateSyncPersonalProjectGithubSwr"
import { useQueryCoursePersonalProjectSwr } from "@/hooks/swr/useQueryCoursePersonalProjectSwr"
import { useQueryPersonalProjectTaskWorkspaceSwr } from "@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr"
import { useQueryPersonalTaskAttemptsSwr } from "@/hooks/swr/useQueryPersonalTaskAttemptsSwr"
import { CoursePersonalProjectTaskPageBase } from "./component"

/** Route identity required to resolve one personal-project task workspace. */
export type CoursePersonalProjectTaskPageProps = { readonly displayId: string; readonly taskId: string }

const COPY = {
    en: {
        fallbackTitle: "Personal project task", fallbackDescription: "Complete this task to advance your personal project.",
        back: "Back to personal project", criteria: "Evaluation criteria", showCriteria: "Show criteria", hideCriteria: "Hide criteria",
        implementation: "Implementation notes", points: (score: number) => `${score} points`, submission: "Project GitHub",
        repository: "GitHub repository URL", repositoryPlaceholder: "https://github.com/owner/repository", settings: "Grading settings",
        language: "Language", model: "Grading model", branch: "Branch", branchPlaceholder: "main", token: "Private repository token",
        tokenPlaceholder: "Paste a new token", tokenStored: (last4: string) => `Stored token ending in ${last4}`,
        settingsSaved: "Grading settings saved.", evaluate: "Evaluate", feedback: "View feedback", history: "Attempt history",
        latest: "Latest grading", passed: "Passed", needsWork: "Needs another pass", saveSettings: "Save settings", retry: "Try again",
        invalidRepository: "Enter a valid HTTPS GitHub repository URL.", loadFailed: "This personal-project task could not be loaded.",
        submitFailed: "The task could not be submitted. Try again.", settingsFailed: "The grading settings could not be saved.", auto: "Auto (recommended)",
    },
    vi: {
        fallbackTitle: "Bài tập đồ án cá nhân", // vn-ok: localized Vietnamese interface copy.
        fallbackDescription: "Hoàn thành bài này để tiếp tục đồ án cá nhân.", // vn-ok: localized Vietnamese interface copy.
        back: "Quay lại dự án cá nhân", // vn-ok: localized Vietnamese interface copy.
        criteria: "Tiêu chí đánh giá", // vn-ok: localized Vietnamese interface copy.
        showCriteria: "Xem tiêu chí", // vn-ok: localized Vietnamese interface copy.
        hideCriteria: "Thu gọn tiêu chí", // vn-ok: localized Vietnamese interface copy.
        implementation: "Hướng dẫn triển khai", // vn-ok: localized Vietnamese interface copy.
        points: (score: number) => `${score} điểm`, // vn-ok: localized Vietnamese interface copy.
        submission: "Project GitHub",
        repository: "URL GitHub repo",
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
        invalidRepository: "Nhập URL GitHub HTTPS hợp lệ.", // vn-ok: localized Vietnamese interface copy.
        loadFailed: "Không thể tải bài tập đồ án cá nhân này.", // vn-ok: localized Vietnamese interface copy.
        submitFailed: "Không thể nộp bài. Hãy thử lại.", // vn-ok: localized Vietnamese interface copy.
        settingsFailed: "Không thể lưu cài đặt chấm bài.", // vn-ok: localized Vietnamese interface copy.
        auto: "Tự động (khuyên dùng)", // vn-ok: localized Vietnamese interface copy.
    },
} as const

const isGithubRepository = (value: string) => /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/u.test(value.trim())

/** Resolves real task/settings contracts, persists grading choices and opens the result route. */
export const CoursePersonalProjectTaskPage = ({ displayId, taskId }: CoursePersonalProjectTaskPageProps) => {
    const locale = useLocale()
    const copy = locale === "vi" ? COPY.vi : COPY.en
    const router = useRouter()
    const project = useQueryCoursePersonalProjectSwr(displayId)
    const courseId = project.data?.course.id
    const workspace = useQueryPersonalProjectTaskWorkspaceSwr(courseId, taskId)
    const attempts = useQueryPersonalTaskAttemptsSwr(courseId, taskId)
    const submission = useMutateSubmitPersonalTaskAttemptSwr()
    const settings = useMutateSyncPersonalProjectGithubSwr()
    const [repository, setRepository] = useState("")
    const [repositoryTouched, setRepositoryTouched] = useState(false)
    const [branch, setBranch] = useState("")
    const [token, setToken] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState<string>()
    const [selectedModel, setSelectedModel] = useState("auto")
    const [criteriaExpanded, setCriteriaExpanded] = useState(true)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [settingsSaved, setSettingsSaved] = useState(false)

    useEffect(() => {
        const data = workspace.data
        if (data === undefined) return
        setRepository((value) => value === "" ? (data.repository.githubUrl ?? "") : value)
        setBranch((value) => value === "" ? (data.repository.branch ?? "main") : value)
        const languages = [...data.task.briefs, ...data.task.codeImplementations]
            .map((item) => item.lang)
            .filter((value, index, values) => values.indexOf(value) === index)
        setSelectedLanguage((value) => value ?? languages[0] ?? "agnostic")
    }, [workspace.data])

    const task = workspace.data?.task
    const languages = useMemo(() => {
        const values = [...(task?.briefs ?? []), ...(task?.codeImplementations ?? [])]
            .map((item) => item.lang)
            .filter((value, index, items) => items.indexOf(value) === index)
        return values.length === 0 ? ["agnostic"] : values
    }, [task])
    const brief = task?.briefs.find((item) => item.lang === selectedLanguage)?.body
        ?? task?.briefs[0]?.body
        ?? task?.description
    const implementationRow = task?.codeImplementations.find((item) => item.lang === selectedLanguage)
        ?? task?.codeImplementations[0]
    const implementation = implementationRow === undefined
        ? undefined
        : [implementationRow.guide, implementationRow.example].filter(Boolean).join("\n\n")
    const selectedModelData = workspace.data?.models.find((model) => `${model.provider}:${model.model}` === selectedModel)
    const repositoryInvalid = repositoryTouched && !isGithubRepository(repository)
    const failedToLoad = project.error !== undefined || workspace.error !== undefined
    const pending = project.data === undefined || (courseId !== undefined && workspace.data === undefined && workspace.error === undefined)
    const state = submission.error !== undefined
        ? "failed"
        : submission.isMutating
            ? "submitting"
            : failedToLoad
                ? "failed"
                : pending
                    ? "pending"
                    : "ready"
    const notice = repositoryInvalid
        ? copy.invalidRepository
        : settings.error !== undefined
            ? copy.settingsFailed
            : submission.error !== undefined
                ? copy.submitFailed
                : failedToLoad
                    ? copy.loadFailed
                    : undefined

    const submit = async () => {
        if (courseId === undefined) return
        setRepositoryTouched(true)
        if (!isGithubRepository(repository)) return
        try {
            await submission.trigger({
                courseId,
                taskId,
                githubUrl: repository,
                branch: branch.trim() || null,
                selectedModel: selectedModelData?.model,
                selectedModelProvider: selectedModelData?.provider,
                lang: selectedLanguage === "agnostic" ? undefined : selectedLanguage,
            })
            await Promise.all([project.mutate(), workspace.mutate(), attempts.mutate()])
            router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}/result`)
        } catch {
            // Mutation hooks retain the backend error for the pure state mapper.
        }
    }
    const saveSettings = async () => {
        if (courseId === undefined) return
        setRepositoryTouched(true)
        if (!isGithubRepository(repository)) return
        setSettingsSaved(false)
        try {
            await settings.trigger({
                courseId,
                githubUrl: repository,
                branch: branch.trim() || null,
                githubToken: token.trim() || undefined,
            })
            await workspace.mutate()
            setToken("")
            setSettingsSaved(true)
        } catch {
            // The mutation hook owns the public failure state.
        }
    }

    return <CoursePersonalProjectTaskPageBase
        state={state}
        props={{
            title: task?.title ?? copy.fallbackTitle,
            description: task?.description ?? copy.fallbackDescription,
            difficulty: task?.difficulty ?? undefined,
            maxScore: task?.maxScore ?? 0,
            brief,
            hint: task?.hint,
            criteria: (task?.criterias ?? []).slice().sort((left, right) => left.orderIndex - right.orderIndex),
            criteriaExpanded,
            implementation,
            repositoryUrl: workspace.data?.repository.githubUrl ?? undefined,
            repositoryDraft: repository,
            repositoryState: repositoryInvalid ? "invalid" : "ready",
            branch: branch || workspace.data?.repository.branch || undefined,
            tokenLast4: workspace.data?.repository.tokenLast4 ?? undefined,
            languageOptions: languages.map((language) => ({ id: language, label: language })),
            selectedLanguage,
            modelOptions: [
                { id: "auto", label: copy.auto },
                ...(workspace.data?.models ?? []).map((model) => ({
                    id: `${model.provider}:${model.model}`,
                    label: `${model.model} · ${model.category}`,
                    disabled: !model.available,
                })),
            ],
            selectedModel,
            settingsOpen,
            settingsState: settings.isMutating ? "saving" : settings.error !== undefined ? "failed" : settingsSaved ? "saved" : "ready",
            latestAttempt: attempts.data?.data?.[0],
            notice,
            labels: copy,
        }}
        on={{
            back: () => router.push(`/courses/${displayId}/learn/personal-project`),
            toggleCriteria: () => setCriteriaExpanded((value) => !value),
            changeRepository: (value) => { setRepository(value); setRepositoryTouched(true) },
            openSettings: () => setSettingsOpen(true),
            closeSettings: () => setSettingsOpen(false),
            selectLanguage: setSelectedLanguage,
            selectModel: setSelectedModel,
            changeBranch: setBranch,
            changeToken: setToken,
            saveSettings: () => { void saveSettings() },
            submit: () => { void submit() },
            retry: () => { void submit() },
            openFeedback: () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}/result`),
            openHistory: () => router.push(`/courses/${displayId}/learn/personal-project/tasks/${taskId}/result?history=1`),
        }}
    />
}

/** Source-level ownership marker for the connected learning page. */
export const meta = { world: "connected", domain: "learn" } as const
