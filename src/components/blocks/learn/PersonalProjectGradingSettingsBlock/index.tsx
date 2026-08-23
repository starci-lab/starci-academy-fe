"use client"

import { useEffect, useMemo, useState } from "react"
import { useLocale } from "next-intl"
import { useMutateSyncPersonalProjectGithubSwr } from "@/hooks/swr/useMutateSyncPersonalProjectGithubSwr"
import { useQueryPersonalProjectTaskWorkspaceSwr } from "@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr"
import { PersonalProjectGradingSettingsBlockBase } from "./component"
import type { PersonalProjectGradingSettingsLabels } from "./component"

type Props = { readonly courseId: string; readonly taskId: string }
const COPY: Record<"en" | "vi", PersonalProjectGradingSettingsLabels & { readonly auto: string; readonly tokenPlaceholder: string }> = {
    en: { language: "Language", model: "Grading model", branch: "Branch", branchPlaceholder: "main", token: "Private repository token", tokenPlaceholder: "Paste a new token", tokenStored: (last4) => `Stored token ending in ${last4}`, settingsSaved: "Grading settings saved.", saveSettings: "Save settings", auto: "Auto (recommended)" },
    vi: { language: "Ngôn ngữ", model: "Mô hình chấm", branch: "Branch", branchPlaceholder: "main", token: "Token repo riêng tư", tokenPlaceholder: "Dán token mới", tokenStored: (last4) => `Đã lưu token kết thúc bằng ${last4}`, settingsSaved: "Đã lưu cài đặt chấm bài.", saveSettings: "Lưu cài đặt", auto: "Tự động (khuyên dùng)" }, // vn-ok: localized settings copy.
}

/** Connected owner for grading choices and enrollment-owned repository settings. */
export const PersonalProjectGradingSettingsBlock = ({ courseId, taskId }: Props) => {
    const locale = useLocale()
    const copy = COPY[locale === "vi" ? "vi" : "en"]
    const workspace = useQueryPersonalProjectTaskWorkspaceSwr(courseId, taskId)
    const settings = useMutateSyncPersonalProjectGithubSwr()
    const [branch, setBranch] = useState("")
    const [token, setToken] = useState("")
    const [selectedLanguage, setSelectedLanguage] = useState<string>()
    const [selectedModel, setSelectedModel] = useState("auto")
    const [saved, setSaved] = useState(false)
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
            await settings.trigger({ courseId, githubUrl: workspace.data?.repository.githubUrl ?? null, branch: branch.trim() || null, githubToken: token.trim() || undefined })
            await workspace.mutate()
            setToken("")
            setSaved(true)
        } catch { /* mutation state owns the visible failure */ }
    }
    return <PersonalProjectGradingSettingsBlockBase state={settings.isMutating ? "saving" : settings.error !== undefined ? "failed" : saved ? "saved" : "ready"} props={{ labels: copy, languageOptions: languages.map((language) => ({ id: language, label: language })), selectedLanguage, modelOptions: [{ id: "auto", label: copy.auto }, ...(workspace.data?.models ?? []).map((model) => ({ id: `${model.provider}:${model.model}`, label: `${model.model} · ${model.category}`, disabled: !model.available }))], selectedModel, branch: branch || workspace.data?.repository.branch || undefined, tokenLast4: workspace.data?.repository.tokenLast4 ?? undefined, notice: "Settings could not be saved." }} on={{ selectLanguage: setSelectedLanguage, selectModel: setSelectedModel, changeBranch: setBranch, changeToken: setToken, saveSettings: () => { void save() } }} />
}

/** Connected ownership marker for grading settings. */
export const meta = { world: "connected", domain: "learn" } as const
