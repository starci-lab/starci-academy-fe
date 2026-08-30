"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useMutateSyncPersonalProjectGithubSwr } from "@/hooks/swr/useMutateSyncPersonalProjectGithubSwr"
import { useQueryPersonalProjectTaskWorkspaceSwr } from "@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr"
import { PersonalProjectGradingSettingsBlockBase } from "./component"
import type { PersonalProjectGradingSettingsLabels } from "./component"

/** Course and task identity required to load grading settings. */
export type PersonalProjectGradingSettingsBlockProps = { readonly courseId: string; readonly taskId: string; readonly repositoryUrl?: string }
const COPY: Record<"en" | "vi", PersonalProjectGradingSettingsLabels & { readonly auto: string; readonly tokenPlaceholder: string; readonly failure: string; readonly repositoryRequired: string }> = {
    en: { language: "Language", model: "Grading model", branch: "Branch", branchPlaceholder: "main", token: "Private repository token", tokenPlaceholder: "Paste a fine-grained token", tokenStored: (last4) => `Private access ready · token ending ${last4}`, settingsSaved: "Grading settings saved.", saveSettings: "Save settings", auto: "Auto (recommended)", description: "Choose exactly what StarCi may read and how this task is analysed.", sourceSection: "Repository access", analysisSection: "Analysis profile", branchHelp: "Use the branch containing the code you want graded.", tokenHelp: "Optional for public repositories. For private repositories, use a fine-grained read-only token scoped to this repository.", privacy: "The token is write-only here, stored encrypted, and shown again only by its final four characters.", clearToken: "Remove stored token", failure: "Settings could not be saved.", repositoryRequired: "Enter a valid GitHub repository in step 1 before saving these settings." },
    vi: { language: "Ngôn ngữ", model: "Mô hình chấm", branch: "Branch", branchPlaceholder: "main", token: "Token repo riêng tư", tokenPlaceholder: "Dán fine-grained token", tokenStored: (last4) => `Đã sẵn sàng đọc repo riêng tư · token đuôi ${last4}`, settingsSaved: "Đã lưu cài đặt chấm bài.", saveSettings: "Lưu cài đặt", auto: "Tự động (khuyên dùng)", description: "Chọn chính xác source StarCi được đọc và cách bài này được phân tích.", sourceSection: "Quyền đọc repository", analysisSection: "Hồ sơ phân tích", branchHelp: "Chọn branch đang chứa code cần chấm.", tokenHelp: "Repo public không cần token. Với repo riêng tư, dùng fine-grained token chỉ có quyền đọc và chỉ cấp cho repo này.", privacy: "Token chỉ được ghi, lưu mã hóa và sau đó chỉ hiển thị lại 4 ký tự cuối.", clearToken: "Xóa token đã lưu", failure: "Không thể lưu cài đặt.", repositoryRequired: "Nhập URL GitHub hợp lệ ở bước 1 trước khi lưu cài đặt này." }, // vn-ok: localized settings copy.
}

/** Connected owner for grading choices and enrollment-owned repository settings. */
export const PersonalProjectGradingSettingsBlock = (props: PersonalProjectGradingSettingsBlockProps) => {
    const { courseId, taskId } = props
    const locale = useLocale()
    const copy = COPY[locale === "vi" ? "vi" : "en"]
    const workspace = useQueryPersonalProjectTaskWorkspaceSwr(courseId, taskId)
    const settings = useMutateSyncPersonalProjectGithubSwr()
    const [branch, setBranch] = useState("")
    const [token, setToken] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState<string>()
    const [selectedModel, setSelectedModel] = useState("auto")
    const [saved, setSaved] = useState(false)
    const repositoryForSave = props.repositoryUrl?.trim() || workspace.data?.repository.githubUrl?.trim() || ""
    const repositoryReady = /^https:\/\/github\.com\/[^/\s]+\/[^/\s]+\/?$/u.test(repositoryForSave)
    useEffect(() => {
        const data = workspace.data
        if (data === undefined) return
        setBranch((value) => value === "" ? (data.repository.branch ?? "main") : value)
        const languages = [...data.task.briefs, ...data.task.codeImplementations].map((item) => item.lang).filter((value, index, values) => values.indexOf(value) === index)
        setSelectedLanguage((value) => value ?? languages[0] ?? "agnostic")
    }, [workspace.data])
    const languages = useMemo(() => {
        const values = [...(workspace.data?.task.briefs ?? []), ...(workspace.data?.task.codeImplementations ?? [])].map((item) => item.lang).filter((value, index, items) => items.indexOf(value) === index)
        return values.length === 0 ? ["agnostic"] : values
    }, [workspace.data])
    const save = async () => {
        setSaved(false)
        try {
            if (!repositoryReady) return
            await settings.trigger({ courseId, githubUrl: repositoryForSave, branch: branch.trim() || workspace.data?.repository.branch || "main", githubToken: token.trim() || undefined })
            await workspace.mutate()
            setToken("")
            setSaved(true)
        } catch { /* mutation state owns the visible failure */ }
    }
    const clearToken = async () => {
        setSaved(false)
        try {
            await settings.trigger({ courseId, clearGithubToken: true })
            await workspace.mutate()
            setToken("")
            setSaved(true)
        } catch { /* mutation state owns the visible failure */ }
    }
    const failureNotice = settings.error instanceof Error && settings.error.message.trim() !== ""
        ? settings.error.message
        : copy.failure
    return <PersonalProjectGradingSettingsBlockBase state={settings.isMutating ? "saving" : settings.error !== undefined ? "failed" : saved ? "saved" : "ready"} props={{ labels: copy, languageOptions: languages.map((language) => ({ id: language, label: language })), selectedLanguage, modelOptions: [{ id: "auto", label: copy.auto }, ...(workspace.data?.models ?? []).map((model) => ({ id: `${model.provider}:${model.model}`, label: `${model.model} · ${model.category}`, disabled: !model.available }))], selectedModel, branch: branch || workspace.data?.repository.branch || undefined, tokenLast4: workspace.data?.repository.tokenLast4 ?? undefined, notice: failureNotice, validationNotice: repositoryReady ? undefined : copy.repositoryRequired, saveDisabled: !repositoryReady }} on={{ selectLanguage: setSelectedLanguage, selectModel: setSelectedModel, changeBranch: setBranch, changeToken: setToken, clearToken: () => { void clearToken() }, saveSettings: () => { void save() } }} />
}

/** Connected ownership marker for grading settings. */
