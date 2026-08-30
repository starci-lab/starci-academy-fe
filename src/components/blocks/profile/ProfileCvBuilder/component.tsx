import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { Icon } from "@/components/leaves/Icon"
import { IconTile } from "@/components/leaves/IconTile"
import { Input } from "@/components/leaves/Input"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { Select } from "@/components/leaves/Select"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import type { CvBlock, CvBlockType, CvDocument } from "@/modules/types/cv"
import type { ReactNode } from "react"
import {
    cvBuilderActionsClassName,
    cvBuilderClassName,
    cvBuilderEditorClassName,
    cvBuilderFeedbackClassName,
    cvBuilderFieldClassName,
    cvBuilderFieldsClassName,
    cvBuilderFormClassName,
    cvBuilderHeaderClassName,
    cvBuilderModeClassName,
    cvBuilderOutlineClassName,
    cvBuilderOutlineItemClassName,
    cvBuilderOutlineListClassName,
    cvBuilderPaperClassName,
    cvBuilderPaperHeadingClassName,
    cvBuilderPaperContactClassName,
    cvBuilderPaperIdentityClassName,
    cvBuilderPaperNameClassName,
    cvBuilderPaperRoleClassName,
    cvBuilderPaperSectionClassName,
    cvBuilderPaperStageClassName,
    cvBuilderPreviewClassName,
    cvBuilderPreviewHeaderClassName,
    cvBuilderProgressBarClassName,
    cvBuilderProgressClassName,
    cvBuilderProgressHeaderClassName,
    cvBuilderProgressTrackClassName,
    cvBuilderSectionClassName,
    cvBuilderSectionHeaderClassName,
    cvBuilderSettingsClassName,
    cvBuilderSituationClassName,
    cvBuilderTexClassName,
    cvBuilderTitleClassName,
    cvBuilderWideFieldClassName,
    cvBuilderWorkspaceClassName,
    cvBuilderPdfLinkClassName,
    getCvBuilderModeButtonClassName,
} from "./classNames"

type CvBuilderMode = "blocks" | "latex"
type SaveState = "saved" | "saving" | "error"

/** Settled data required to edit, compile and publish one CV. */
export type ProfileCvBuilderData = {
    readonly situation?: "ready" | "loading" | "error"
    readonly document?: CvDocument
    readonly mode: CvBuilderMode
    readonly texDraft: string
    readonly previewUrl?: string
    readonly saveState: SaveState
    readonly completeness: number
    readonly isCreating: boolean
    readonly isCompiling: boolean
    readonly isRewriting: boolean
    readonly isPublishing: boolean
    readonly mutationMessage?: string
}

/** Outcomes emitted by the CV builder surface. */
export type ProfileCvBuilderActions = {
    readonly create?: () => void
    readonly retry?: () => void
    readonly mode?: (mode: CvBuilderMode) => void
    readonly field?: (type: CvBlockType, key: string, value: string) => void
    readonly documentStyle?: (key: "template" | "language", value: string) => void
    readonly tex?: (value: string) => void
    readonly rewrite?: (type: CvBlockType) => void
    readonly compile?: () => void
    readonly publish?: () => void
}

/** CV builder input and outcomes. */
export type ProfileCvBuilderProps = { readonly props: ProfileCvBuilderData; readonly on?: ProfileCvBuilderActions }

const blockOf = (document: CvDocument, type: CvBlockType) => document.blocks.find((block) => block.type === type)
const valueOf = (block: CvBlock | undefined, key: string) => {
    if (block?.type === "skills" && key === "skillsText") return block.items.map((item) => typeof item.fields.name === "string" ? item.fields.name : "").filter(Boolean).join(", ")
    const value = block?.items[0]?.fields[key]
    return typeof value === "string" ? value : ""
}

type FieldProps = { readonly document: CvDocument; readonly type: CvBlockType; readonly name: string; readonly label: string; readonly placeholder: string; readonly wide?: boolean; readonly on?: ProfileCvBuilderActions["field"] }
const Field = (props: FieldProps) => {
    const value = valueOf(blockOf(props.document, props.type), props.name)
    return <label className={props.wide ? cvBuilderWideFieldClassName : cvBuilderFieldClassName}>
        {props.label}
        <Input key={`${props.type}-${props.name}-${value}`} props={{ id: `cv-${props.type}-${props.name}`, name: `${props.type}.${props.name}`, defaultValue: value, placeholder: props.placeholder }} on={{ change: (next) => props.on?.(props.type, props.name, next) }} />
    </label>
}

type ProseFieldProps = { readonly document: CvDocument; readonly type: CvBlockType; readonly name: string; readonly label: string; readonly placeholder: string; readonly rows?: number; readonly on?: ProfileCvBuilderActions["field"] }
const ProseField = (props: ProseFieldProps) => {
    const value = valueOf(blockOf(props.document, props.type), props.name)
    return <label className={cvBuilderWideFieldClassName}>
        {props.label}
        <Textarea key={`${props.type}-${props.name}-${value}`} props={{ id: `cv-${props.type}-${props.name}`, name: `${props.type}.${props.name}`, label: props.label, defaultValue: value, placeholder: props.placeholder, rows: props.rows ?? 4 }} on={{ change: (next) => props.on?.(props.type, props.name, next) }} />
    </label>
}

type DraftPaperProps = { readonly document: CvDocument }
const DraftPaper = (props: DraftPaperProps) => {
    const document = props.document
    const personal = blockOf(document, "personal")
    const summary = blockOf(document, "summary")
    const experience = blockOf(document, "experience")
    const project = blockOf(document, "project")
    const skills = blockOf(document, "skills")
    const name = valueOf(personal, "name") || document.label
    const role = valueOf(personal, "role")
    const contact = [valueOf(personal, "email"), valueOf(personal, "phone"), valueOf(personal, "location")].filter(Boolean).join(" · ")
    const section = (block: CvBlock | undefined, body: string) => body.trim() === "" ? null : <section className={cvBuilderPaperSectionClassName}><div className={cvBuilderPaperHeadingClassName}><Heading props={{ content: block?.title ?? "", level: 3 }} /></div><p>{body}</p></section>
    const skillText = skills?.items.map((item) => typeof item.fields.name === "string" ? item.fields.name : "").filter(Boolean).join(" · ") ?? ""
    return <article className={cvBuilderPaperClassName} aria-label={`Bản nháp ${document.label}`}> {/* vn-ok: localized Vietnamese interface copy. */}
        <header className={cvBuilderPaperIdentityClassName}><div className={cvBuilderPaperNameClassName}><Heading props={{ content: name, level: 2 }} /></div>{role && <p className={cvBuilderPaperRoleClassName}>{role}</p>}{contact && <p className={cvBuilderPaperContactClassName}>{contact}</p>}</header>
        {section(summary, valueOf(summary, "text"))}
        {section(experience, [valueOf(experience, "role"), valueOf(experience, "company"), valueOf(experience, "bullets")].filter(Boolean).join(" — "))}
        {section(project, [valueOf(project, "title"), valueOf(project, "description")].filter(Boolean).join(" — "))}
        {section(skills, skillText)}
    </article>
}

type SectionHeaderProps = { readonly eyebrow: string; readonly title: string; readonly description?: string; readonly action?: ReactNode }
const SectionHeader = (props: SectionHeaderProps) => <div className={cvBuilderSectionHeaderClassName}><div><Text props={{ content: props.eyebrow, size: "xs" }} /><Heading props={{ content: props.title, level: 3 }} />{props.description && <Text props={{ content: props.description, size: "sm", tone: "muted" }} />}</div>{props.action}</div>

/** Draws the owner-only StarCi CV builder or its honest initial situation. */
export const ProfileCvBuilderBase = (props: ProfileCvBuilderProps) => {
    const data = props.props
    const on = props.on
    const document = data.document
    if (data.situation === "loading") return <SurfaceCard><div className={cvBuilderSituationClassName}><Text props={{ content: "Đang mở CV Builder…", tone: "muted", live: "polite" }} /></div></SurfaceCard> // vn-ok: localized Vietnamese interface copy.
    if (data.situation === "error") return <SurfaceCard><div className={cvBuilderSituationClassName}><IconTile props={{ icon: "retry", tone: "accent", size: "md" }} /><Heading props={{ content: "Không tải được dữ liệu CV", level: 2 }} /><Button props={{ label: "Thử lại", variant: "secondary", icon: "retry" }} on={{ press: on?.retry }} /></div></SurfaceCard> // vn-ok: localized Vietnamese interface copy.
    if (!document) return <SurfaceCard><div className={cvBuilderSituationClassName}><IconTile props={{ icon: "saved", tone: "accent", size: "md" }} /><Heading props={{ content: "Tạo CV bằng LaTeX", level: 2 }} /><Text props={{ content: "Nhập dữ liệu theo từng mục, dùng AI để chỉnh câu chữ và biên dịch thành PDF ATS-friendly.", tone: "muted" }} /><Button props={{ label: "Tạo CV đầu tiên", variant: "primary", icon: "talents", isPending: data.isCreating }} on={{ press: on?.create }} /></div></SurfaceCard> // vn-ok: localized Vietnamese interface copy.

    const saveLabel = data.saveState === "saving" ? "Đang lưu…" : data.saveState === "error" ? "Chưa lưu được" : "Đã lưu" // vn-ok: localized Vietnamese interface copy.
    const outline = ["Thông tin cá nhân", "Tóm tắt", "Kinh nghiệm", "Dự án", "Kỹ năng", "Học vấn"]
    return <div className={cvBuilderClassName}>
        <header className={cvBuilderHeaderClassName}>
            <div className={cvBuilderTitleClassName}><Text props={{ content: "CV BUILDER · LATEX", size: "xs" }} /><Heading props={{ content: document.label, level: 2 }} /><Text props={{ content: "Biến dữ liệu thật thành một CV rõ ràng, dễ đọc và dễ qua ATS.", tone: "muted", size: "sm" }} /><Text props={{ content: saveLabel, size: "xs", icon: data.saveState === "error" ? "retry" : "complete" }} /></div> {/* vn-ok: localized Vietnamese interface copy. */}
            <div className={cvBuilderActionsClassName}><Button props={{ label: document.isPublic ? "Đang công khai" : "Đặt công khai", variant: "secondary", icon: "send", isPending: data.isPublishing }} on={{ press: on?.publish }} /><Button props={{ label: "Biên dịch PDF", variant: "primary", icon: "review", isPending: data.isCompiling }} on={{ press: on?.compile }} />{data.previewUrl && <a href={data.previewUrl} target="_blank" rel="noreferrer" className={cvBuilderPdfLinkClassName}><Icon props={{ name: "explore", role: "chip" }} />Mở PDF</a>}</div> {/* vn-ok: localized Vietnamese interface copy. */}
        </header>
        {data.mutationMessage && <div className={cvBuilderFeedbackClassName}><Text props={{ content: data.mutationMessage, size: "sm", live: data.saveState === "error" ? "assertive" : "polite" }} /></div>}
        <div className={cvBuilderWorkspaceClassName}>
            <aside className={cvBuilderOutlineClassName} aria-label="Cấu trúc CV"><SurfaceCard props={{ inset: "compact" }}><div className={cvBuilderProgressClassName}><div className={cvBuilderProgressHeaderClassName}><Text props={{ content: "Mức hoàn thiện", size: "sm" }} /><Text props={{ content: `${data.completeness}%`, weight: "semibold" }} /></div><div className={cvBuilderProgressTrackClassName} role="progressbar" aria-label="Mức hoàn thiện CV" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.completeness}><div className={cvBuilderProgressBarClassName} style={{ width: `${data.completeness}%` }} /></div><Text props={{ content: data.completeness === 100 ? "Đủ dữ liệu cốt lõi để ứng tuyển." : "Hoàn thiện các mục cốt lõi trước khi công khai.", size: "xs" }} /></div><div className={cvBuilderOutlineListClassName}>{outline.map((item) => <div key={item} className={cvBuilderOutlineItemClassName}><span>{item}</span><Icon props={{ name: "complete", role: "chip" }} /></div>)}</div><div className={cvBuilderSettingsClassName}><label htmlFor="cv-template" className={cvBuilderFieldClassName}>Mẫu CV<Select props={{ id: "cv-template", name: "template", label: "Mẫu CV", selectedKey: document.style.template ?? "classic", options: [{ id: "classic", label: "Cổ điển · ATS" }, { id: "modern", label: "Hiện đại" }, { id: "minimal", label: "Tối giản" }] }} on={{ select: (value) => on?.documentStyle?.("template", value) }} /></label><label htmlFor="cv-language" className={cvBuilderFieldClassName}>Ngôn ngữ<Select props={{ id: "cv-language", name: "language", label: "Ngôn ngữ", selectedKey: document.style.language ?? "vi", options: [{ id: "vi", label: "Tiếng Việt" }, { id: "en", label: "English" }] }} on={{ select: (value) => on?.documentStyle?.("language", value) }} /></label></div></SurfaceCard></aside> {/* vn-ok: localized Vietnamese interface copy. */}
            <main className={cvBuilderEditorClassName}><SurfaceCard props={{ inset: "compact" }}><div className={cvBuilderModeClassName} role="tablist" aria-label="Chế độ soạn CV"><button type="button" role="tab" aria-selected={data.mode === "blocks"} className={getCvBuilderModeButtonClassName(data.mode === "blocks")} onClick={() => on?.mode?.("blocks")}>Khối nội dung</button><button type="button" role="tab" aria-selected={data.mode === "latex"} className={getCvBuilderModeButtonClassName(data.mode === "latex")} onClick={() => on?.mode?.("latex")}>Mã LaTeX</button></div>{data.mode === "latex" ? <textarea aria-label="Mã nguồn LaTeX" value={data.texDraft} onChange={(event) => on?.tex?.(event.target.value)} className={cvBuilderTexClassName} /> : <div className={cvBuilderFormClassName}> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 1 · NỀN TẢNG" title="Thông tin cá nhân" description="Tạo phần đầu của CV và thông tin liên hệ." /><div className={cvBuilderFieldsClassName}><Field document={document} type="personal" name="name" label="Họ tên" placeholder="Nguyễn Văn A" on={on?.field} /><Field document={document} type="personal" name="role" label="Vị trí ứng tuyển" placeholder="Backend Developer" on={on?.field} /><Field document={document} type="personal" name="email" label="Email" placeholder="ban@email.com" on={on?.field} /><Field document={document} type="personal" name="phone" label="Số điện thoại" placeholder="0901 234 567" on={on?.field} /><Field document={document} type="personal" name="location" label="Nơi ở" placeholder="TP. Hồ Chí Minh" on={on?.field} /><Field document={document} type="personal" name="githubUsername" label="GitHub" placeholder="github.com/username" on={on?.field} /></div></section>
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 2 · ĐỊNH VỊ" title="Tóm tắt nghề nghiệp" description="AI chỉ đề xuất; bạn duyệt trước khi lưu." action={<Button props={{ label: "AI viết giúp", variant: "tertiary", size: "sm", icon: "talents", isPending: data.isRewriting }} on={{ press: () => on?.rewrite?.("summary") }} />} /><div className={cvBuilderFieldsClassName}><ProseField document={document} type="summary" name="text" label="Tóm tắt bản thân" placeholder="Giới thiệu ngắn về kinh nghiệm và mục tiêu nghề nghiệp…" on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 3 · KINH NGHIỆM" title="Kinh nghiệm làm việc" action={<Button props={{ label: "AI viết bullet", variant: "tertiary", size: "sm", icon: "talents", isPending: data.isRewriting }} on={{ press: () => on?.rewrite?.("experience") }} />} /><div className={cvBuilderFieldsClassName}><Field document={document} type="experience" name="company" label="Công ty" placeholder="Tên công ty" on={on?.field} /><Field document={document} type="experience" name="role" label="Vị trí" placeholder="Backend Developer" on={on?.field} /><Field document={document} type="experience" name="startDate" label="Bắt đầu" placeholder="Th01/2024" on={on?.field} /><Field document={document} type="experience" name="endDate" label="Kết thúc" placeholder="Hiện tại" on={on?.field} /><ProseField document={document} type="experience" name="bullets" label="Kết quả nổi bật" placeholder="Mỗi dòng là một kết quả có hành động và số liệu…" rows={5} on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 4 · BẰNG CHỨNG" title="Dự án" description="Dự án StarCi đã vượt qua có thể dùng làm bằng chứng xác thực." action={<Button props={{ label: "AI làm rõ tác động", variant: "tertiary", size: "sm", icon: "talents", isPending: data.isRewriting }} on={{ press: () => on?.rewrite?.("project") }} />} /><div className={cvBuilderFieldsClassName}><Field document={document} type="project" name="title" label="Tên dự án" placeholder="StarCi Shop API" on={on?.field} /><Field document={document} type="project" name="description" label="Mô tả" placeholder="Vai trò, công nghệ và kết quả…" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 5 · NĂNG LỰC" title="Kỹ năng" /><div className={cvBuilderFieldsClassName}><Field document={document} type="skills" name="skillsText" label="Danh sách kỹ năng" placeholder="TypeScript, NestJS, PostgreSQL, Docker" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 6 · HỌC VẤN" title="Học vấn" /><div className={cvBuilderFieldsClassName}><Field document={document} type="education" name="school" label="Trường" placeholder="Tên trường" on={on?.field} /><Field document={document} type="education" name="degree" label="Bằng cấp / chuyên ngành" placeholder="Kỹ thuật phần mềm" on={on?.field} /><Field document={document} type="education" name="startDate" label="Bắt đầu" placeholder="2019" on={on?.field} /><Field document={document} type="education" name="endDate" label="Kết thúc" placeholder="2023" on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BỔ SUNG · LEGACY" title="Điểm khác biệt" description="Các mục tùy chọn từ CV StarCi cũ; để trống nếu không cần." /><div className={cvBuilderFieldsClassName}><Field document={document} type="achievement" name="title" label="Thành tích" placeholder="Giải thưởng hoặc cột mốc" on={on?.field} /><Field document={document} type="certification" name="title" label="Chứng chỉ" placeholder="Tên chứng chỉ" on={on?.field} /><Field document={document} type="language" name="name" label="Ngoại ngữ" placeholder="English · B2" on={on?.field} /><Field document={document} type="activity" name="description" label="Hoạt động" placeholder="Cộng đồng hoặc tình nguyện" on={on?.field} /><Field document={document} type="interest" name="name" label="Sở thích" placeholder="Đọc sách, chạy bộ…" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
            </div>}</SurfaceCard></main>
            <aside className={cvBuilderPreviewClassName} aria-label="Bản xem trước CV"><SurfaceCard props={{ inset: "compact" }}><div className={cvBuilderPreviewHeaderClassName}><div><Heading props={{ content: "Bản xem trước", level: 3 }} /><Text props={{ content: data.previewUrl ? "PDF đã biên dịch" : "Bản nháp ATS · A4", size: "xs" }} /></div><Button props={{ label: "Biên dịch lại", variant: "secondary", size: "sm", icon: "retry", isPending: data.isCompiling }} on={{ press: on?.compile }} /></div>{data.previewUrl ? <ProfileCvDocument props={{ title: document.label, src: data.previewUrl }} /> : <div className={cvBuilderPaperStageClassName}><DraftPaper document={document} /></div>}</SurfaceCard></aside> {/* vn-ok: localized Vietnamese interface copy. */}
        </div>
    </div>
}
