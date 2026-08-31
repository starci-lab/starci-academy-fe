"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import {
    useMutateCreateCvBlocksSwr,
    useMutateRenderCvBlocksSwr,
    useMutateRewriteCvBlockSwr,
    useMutateUpdateCvBlocksSwr,
} from "@/hooks/swr/useMutateCvBlocksSwr"
import { useQueryMyCvBlocksSwr } from "@/hooks/swr/useQueryMyCvBlocksSwr"
import type { CvBlock, CvBlockItem, CvBlockType, CvDocument, CvStyle } from "@/modules/types/cv"
import { createStarterCvBlocks, DEFAULT_CV_STYLE } from "@/modules/types/cv"
import { buildCvTexSource } from "./buildCvTexSource"
import { ProfileCvBuilderBase } from "./component"

type Mode = "blocks" | "latex"
type SaveState = "saved" | "saving" | "error"

const emptyCopyOf = (locale: string) => locale.startsWith("en")
    ? { title: "Create your CV with LaTeX", description: "Enter your details by section, use AI to refine the wording, and compile an ATS-friendly PDF.", create: "Create your first CV" }
    : { title: "Tạo CV bằng LaTeX", description: "Nhập dữ liệu theo từng mục, dùng AI để chỉnh câu chữ và biên dịch thành PDF ATS-friendly.", create: "Tạo CV đầu tiên" } // vn-ok: localized Vietnamese CV-builder empty state.

const titles: Record<CvBlockType, string> = {
    personal: "Thông tin cá nhân", summary: "Tóm tắt", experience: "Kinh nghiệm", education: "Học vấn", // vn-ok: localized Vietnamese CV schema titles.
    skills: "Kỹ năng", project: "Dự án", achievement: "Thành tích", certification: "Chứng chỉ", // vn-ok: localized Vietnamese CV schema titles.
    language: "Ngoại ngữ", activity: "Hoạt động", interest: "Sở thích", // vn-ok: localized Vietnamese CV schema titles.
}

const uid = () => globalThis.crypto.randomUUID()
const itemWith = (fields: Readonly<Record<string, unknown>>): CvBlockItem => ({ id: uid(), fields })

const changeField = (document: CvDocument, type: CvBlockType, key: string, value: string): CvDocument => {
    const existing = document.blocks.find((block) => block.type === type)
    const base: CvBlock = existing ?? { id: uid(), type, title: titles[type], order: document.blocks.length, items: [] }
    let items: ReadonlyArray<CvBlockItem>
    if (type === "skills" && key === "skillsText") {
        const values = value.split(",").map((part) => part.trim()).filter(Boolean)
        items = values.map((name, index) => ({ id: base.items[index]?.id ?? uid(), fields: { ...base.items[index]?.fields, name } }))
    } else {
        const first = base.items[0] ?? itemWith({})
        items = [{ ...first, fields: { ...first.fields, [key]: value } }, ...base.items.slice(1)]
    }
    const next = { ...base, items }
    return { ...document, blocks: existing ? document.blocks.map((block) => block.id === existing.id ? next : block) : [...document.blocks, next] }
}

const hasText = (block: CvBlock | undefined, keys: ReadonlyArray<string>) => keys.some((key) => {
    if (block?.type === "skills") return block.items.some((item) => typeof item.fields.name === "string" && item.fields.name.trim() !== "")
    return block?.items.some((item) => typeof item.fields[key] === "string" && item.fields[key].trim() !== "") ?? false
})

const completenessOf = (document: CvDocument | undefined) => {
    if (!document) return 0
    const checks: ReadonlyArray<[CvBlockType, ReadonlyArray<string>]> = [
        ["personal", ["name"]], ["personal", ["email", "phone"]], ["personal", ["role"]],
        ["summary", ["text"]], ["experience", ["company", "role", "bullets"]], ["project", ["title", "description"]],
        ["skills", ["name"]], ["education", ["school", "degree"]],
    ]
    const complete = checks.filter(([type, keys]) => hasText(document.blocks.find((block) => block.type === type), keys)).length
    return Math.round((complete / checks.length) * 100)
}

/** Connected owner-only CV builder backed by StarCi's existing CV-block service. */
export type ProfileCvBuilderProps = { readonly enabled?: boolean }
/** Resolve the signed-in learner's editable CV document and every server outcome. */
export const ProfileCvBuilder = (props: ProfileCvBuilderProps) => {
    const tCv = useTranslations("profile.cv")
    const tProfile = useTranslations("profile")
    const locale = useLocale()
    const params = useParams<{ username?: string }>()
    const router = useRouter()
    const username = params?.username ? String(params.username) : undefined
    const enabled = props.enabled ?? true
    const query = useQueryMyCvBlocksSwr(enabled)
    const create = useMutateCreateCvBlocksSwr()
    const update = useMutateUpdateCvBlocksSwr()
    const render = useMutateRenderCvBlocksSwr()
    const rewrite = useMutateRewriteCvBlockSwr()
    const [document, setDocument] = useState<CvDocument>()
    const [mode, setMode] = useState<Mode>("blocks")
    const [texDraft, setTexDraft] = useState("")
    const [previewUrl, setPreviewUrl] = useState<string>()
    const [saveState, setSaveState] = useState<SaveState>("saved")
    const [message, setMessage] = useState<string>()
    const [revision, setRevision] = useState(0)
    const hydrated = useRef(false)

    useEffect(() => {
        if (hydrated.current || query.data === undefined) return
        const selected = query.data[0]
        setDocument(selected)
        setTexDraft(selected ? buildCvTexSource(selected) : "")
        hydrated.current = true
    }, [query.data])

    const markChanged = useCallback((next: CvDocument) => {
        setDocument(next)
        setSaveState("saving")
        setMessage(undefined)
        setRevision((value) => value + 1)
    }, [])

    useEffect(() => {
        if (revision === 0 || !document) return
        const timer = window.setTimeout(() => {
            void update.trigger({ id: document.id, label: document.label, blocks: document.blocks, style: document.style })
                .then((result) => {
                    const response = result.data?.updateCvBlocks
                    if (response?.success !== true) throw new Error(response?.message ?? "Không thể lưu CV.") // vn-ok: localized Vietnamese recovery copy.
                    setSaveState("saved")
                    void query.mutate()
                })
                .catch(() => { setSaveState("error"); setMessage("Chưa lưu được thay đổi. Dữ liệu vẫn còn trên màn hình để bạn thử lại.") }) // vn-ok: localized Vietnamese recovery copy.
        }, 900)
        return () => window.clearTimeout(timer)
    }, [document, query, revision, update])

    const createDocument = async () => {
        setMessage(undefined)
        try {
            const result = await create.trigger({ label: "CV của tôi", blocks: createStarterCvBlocks(), style: DEFAULT_CV_STYLE }) // vn-ok: localized Vietnamese document fallback.
            const response = result.data?.createCvBlocks
            if (response?.success !== true || !response.data) throw new Error(response?.message)
            setDocument(response.data)
            setTexDraft(buildCvTexSource(response.data))
            hydrated.current = true
            void query.mutate()
        } catch { setMessage("Không thể tạo CV lúc này. Hãy thử lại.") } // vn-ok: localized Vietnamese recovery copy.
    }

    const saveNow = async (current: CvDocument) => {
        const result = await update.trigger({ id: current.id, label: current.label, blocks: current.blocks, style: current.style })
        const response = result.data?.updateCvBlocks
        if (response?.success !== true) throw new Error(response?.message)
    }

    const compileDocument = async () => {
        if (!document) return
        setMessage(undefined)
        try {
            setSaveState("saving")
            await saveNow(document)
            const tex = mode === "latex" ? texDraft : buildCvTexSource(document)
            const result = await render.trigger({ id: document.id, tex, format: "pdf" })
            const response = result.data?.renderCvBlocks
            if (response?.success !== true || !response.data?.url) throw new Error(response?.message)
            setPreviewUrl(response.data.url)
            setTexDraft(tex)
            setSaveState("saved")
            setMessage("PDF đã được biên dịch từ dữ liệu hiện tại.") // vn-ok: localized Vietnamese outcome copy.
            void query.mutate()
        } catch { setSaveState("error"); setMessage("LaTeX chưa biên dịch được. Chuyển sang Mã LaTeX để kiểm tra nội dung và thử lại.") } // vn-ok: localized Vietnamese recovery copy.
    }

    const rewriteBlock = async (type: CvBlockType) => {
        if (!document) return
        const block = document.blocks.find((candidate) => candidate.type === type)
        if (!block || !hasText(block, Object.keys(block.items[0]?.fields ?? {}))) {
            setMessage("Hãy nhập nội dung gốc trước khi nhờ AI viết lại.") // vn-ok: localized Vietnamese recovery copy.
            return
        }
        setMessage(undefined)
        try {
            const result = await rewrite.trigger({ block, instruction: "Viết rõ ràng, trung thực, ưu tiên hành động và kết quả; không bịa dữ kiện." }) // vn-ok: Vietnamese AI instruction is the runtime payload.
            const response = result.data?.rewriteCvBlock
            if (response?.success !== true || !response.data?.block) throw new Error(response?.message)
            markChanged({ ...document, blocks: document.blocks.map((candidate) => candidate.id === block.id ? response.data!.block : candidate) })
            setMessage("AI đã đề xuất bản viết lại. Hãy đọc và chỉnh trước khi biên dịch.") // vn-ok: localized Vietnamese outcome copy.
        } catch { setMessage("AI chưa thể viết lại mục này. Nội dung gốc không bị thay đổi.") } // vn-ok: localized Vietnamese recovery copy.
    }

    const actions = useMemo(() => ({
        create: () => { void createDocument() },
        mode: (next: Mode) => { if (next === "latex" && document && texDraft.trim() === "") setTexDraft(buildCvTexSource(document)); setMode(next) },
        field: (type: CvBlockType, key: string, value: string) => { if (document) markChanged(changeField(document, type, key, value)) },
        documentStyle: (key: "template" | "language", value: string) => {
            if (!document) return
            const style = { ...document.style, [key]: value } as CvStyle
            markChanged({ ...document, style })
        },
        tex: (value: string) => setTexDraft(value),
        rewrite: (type: CvBlockType) => { void rewriteBlock(type) },
        compile: () => { void compileDocument() },
    }), [document, markChanged, texDraft])

    const situation = query.error !== undefined && query.data === undefined ? "error" as const : query.data === undefined ? "loading" as const : "ready" as const
    return <ProfileCvBuilderBase props={{ situation, document, mode, texDraft, previewUrl, saveState, completeness: completenessOf(document), isCreating: create.isMutating, isCompiling: render.isMutating, isRewriting: rewrite.isMutating, mutationMessage: message }} recovery={{ loading: tCv("status.loading"), errorTitle: tCv("states.error.title"), errorDescription: tCv("states.error.description"), retry: tCv("retry"), overview: tProfile("actions.home") }} empty={emptyCopyOf(locale)} retryPending={query.isValidating} on={{ ...actions, retry: () => { void query.mutate() }, overview: () => router.push(`/profile/${username ?? ""}`) }} />
}

export * from "./component"
