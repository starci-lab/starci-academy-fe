import { Input, Button } from "@starci/grammar/common"
import { SurfaceCard } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Icon, iconSourceFor } from "@/components/leaves/Icon"
import { IconTile } from "@starci/grammar/common"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { Select } from "@/components/leaves/Select"
import { Text } from "@starci/grammar/common"
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
    cvBuilderSituationSurfaceClassName,
    cvBuilderTexClassName,
    cvBuilderTitleClassName,
    cvBuilderWideFieldClassName,
    cvBuilderWorkspaceClassName,
    cvBuilderPdfLinkClassName,
    getCvBuilderModeButtonClassName,
} from "./classNames"

type CvBuilderMode = "blocks" | "latex"
type SaveState = "saved" | "saving" | "error"

/** Settled data required to edit and compile one CV. */
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
    readonly mutationMessage?: string
}

/** Outcomes emitted by the CV builder surface. */
export type ProfileCvBuilderActions = {
    readonly create?: () => void
    readonly retry?: () => void
    readonly overview?: () => void
    readonly mode?: (mode: CvBuilderMode) => void
    readonly field?: (type: CvBlockType, key: string, value: string) => void
    readonly documentStyle?: (key: "template" | "language", value: string) => void
    readonly tex?: (value: string) => void
    readonly rewrite?: (type: CvBlockType) => void
    readonly compile?: () => void
}

/** Recovery copy is supplied by the route locale while the base stays presentational. */
export type ProfileCvBuilderRecoveryCopy = {
    readonly loading: string
    readonly errorTitle: string
    readonly errorDescription: string
    readonly retry: string
    readonly overview: string
}

/** Empty-state copy is supplied by the route locale while the base stays presentational. */
export type ProfileCvBuilderEmptyCopy = {
    readonly title: string
    readonly description: string
    readonly create: string
}

/** CV builder input and outcomes. */
export type ProfileCvBuilderProps = { readonly props: ProfileCvBuilderData; readonly on?: ProfileCvBuilderActions; readonly recovery: ProfileCvBuilderRecoveryCopy; readonly empty: ProfileCvBuilderEmptyCopy; readonly retryPending?: boolean }

const blockOf = (document: CvDocument, type: CvBlockType) => document.blocks.find((block) => block.type === type)
const valueOf = (block: CvBlock | undefined, key: string) => {
    if (block?.type === "skills" && key === "skillsText") return block.items.map((item) => typeof item.fields.name === "string" ? item.fields.name : "").filter(Boolean).join(", ")
    const value = block?.items[0]?.fields[key]
    return typeof value === "string" ? value : ""
}

type FieldProps = { readonly document: CvDocument; readonly type: CvBlockType; readonly name: string; readonly label: string; readonly placeholder: string; readonly wide?: boolean; readonly on?: ProfileCvBuilderActions["field"] }
const Field = (props: FieldProps) => {
    const value = valueOf(blockOf(props.document, props.type), props.name)
    return <div className={props.wide ? cvBuilderWideFieldClassName : cvBuilderFieldClassName}>
        <Input key={`${props.type}-${props.name}-${value}`} id={`cv-${props.type}-${props.name}`} name={`${props.type}.${props.name}`} label={props.label} value={value} placeholder={props.placeholder} variant="secondary" onValueChange={(next) => props.on?.(props.type, props.name, next)} />
    </div>
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
    const section = (block: CvBlock | undefined, body: string) => body.trim() === "" ? null : <section className={cvBuilderPaperSectionClassName}><div className={cvBuilderPaperHeadingClassName}><Heading level={3}>{block?.title ?? ""}</Heading></div><p>{body}</p></section>
    const skillText = skills?.items.map((item) => typeof item.fields.name === "string" ? item.fields.name : "").filter(Boolean).join(" · ") ?? ""
    return <article className={cvBuilderPaperClassName} aria-label={`Bản nháp ${document.label}`}> {/* vn-ok: localized Vietnamese interface copy. */}
        <header className={cvBuilderPaperIdentityClassName}><div className={cvBuilderPaperNameClassName}><Heading level={2}>{name}</Heading></div>{role && <p className={cvBuilderPaperRoleClassName}>{role}</p>}{contact && <p className={cvBuilderPaperContactClassName}>{contact}</p>}</header>
        {section(summary, valueOf(summary, "text"))}
        {section(experience, [valueOf(experience, "role"), valueOf(experience, "company"), valueOf(experience, "bullets")].filter(Boolean).join(" — "))}
        {section(project, [valueOf(project, "title"), valueOf(project, "description")].filter(Boolean).join(" — "))}
        {section(skills, skillText)}
    </article>
}

type SectionHeaderProps = { readonly eyebrow: string; readonly title: string; readonly description?: string; readonly action?: ReactNode }
const SectionHeader = (props: SectionHeaderProps) => <div className={cvBuilderSectionHeaderClassName}><div><Text size={"xs"}>{props.eyebrow}</Text><Heading level={3}>{props.title}</Heading>{props.description && <Text size={"sm"} tone={"muted"}>{props.description}</Text>}</div>{props.action}</div>

/** Draws the owner-only StarCi CV builder or its honest initial situation. */
export const ProfileCvBuilderBase = (props: ProfileCvBuilderProps) => {
    const data = props.props
    const on = props.on
    const recovery = props.recovery
    const empty = props.empty
    const document = data.document
    const situationSurface = (children: ReactNode) => <div className={cvBuilderSituationSurfaceClassName}><SurfaceCard composition="joined">{children}</SurfaceCard></div>
    if (data.situation === "loading") return situationSurface(<div className={cvBuilderSituationClassName}><Text tone={"muted"} live={"polite"}>{recovery.loading}</Text></div>)
    if (data.situation === "error") return situationSurface(<div className={cvBuilderSituationClassName}><IconTile source={iconSourceFor("retry", "leading")} tone={"accent"} size={"md"} /><Heading level={2}>{recovery.errorTitle}</Heading><Text tone={"muted"}>{recovery.errorDescription}</Text><div className={cvBuilderActionsClassName}><Button variant="primary" isPending={props.retryPending} onPress={on?.retry}>{recovery.retry}</Button><Button variant="secondary" onPress={on?.overview}>{recovery.overview}</Button></div></div>)
    if (!document) return situationSurface(<div className={cvBuilderSituationClassName}><IconTile source={iconSourceFor("saved", "leading")} tone={"accent"} size={"md"} /><Heading level={2}>{empty.title}</Heading><Text tone={"muted"}>{empty.description}</Text><Button variant="primary" isPending={data.isCreating} onPress={on?.create}>{empty.create}</Button></div>)

    const saveLabel = data.saveState === "saving" ? "Đang lưu…" : data.saveState === "error" ? "Chưa lưu được" : "Đã lưu" // vn-ok: localized Vietnamese interface copy.
    const outline: ReadonlyArray<{ readonly label: string; readonly complete: boolean }> = [
        { label: "Thông tin cá nhân", complete: valueOf(blockOf(document, "personal"), "name").trim() !== "" }, // vn-ok: localized CV outline label.
        { label: "Tóm tắt", complete: valueOf(blockOf(document, "summary"), "text").trim() !== "" }, // vn-ok: localized CV outline label.
        { label: "Kinh nghiệm", complete: valueOf(blockOf(document, "experience"), "role").trim() !== "" }, // vn-ok: localized CV outline label.
        { label: "Dự án", complete: valueOf(blockOf(document, "project"), "title").trim() !== "" }, // vn-ok: localized CV outline label.
        { label: "Kỹ năng", complete: valueOf(blockOf(document, "skills"), "skillsText").trim() !== "" }, // vn-ok: localized CV outline label.
        { label: "Học vấn", complete: valueOf(blockOf(document, "education"), "school").trim() !== "" }, // vn-ok: localized CV outline label.
    ]
    return <div className={cvBuilderClassName}>
        <header className={cvBuilderHeaderClassName}>
            <div className={cvBuilderTitleClassName}><Text size={"xs"}>{"CV BUILDER · LATEX"}</Text><Heading level={2}>{document.label}</Heading><Text size={"sm"} tone={"muted"}>{"Biến dữ liệu thật thành một CV rõ ràng, dễ đọc và dễ qua ATS."}</Text><Text size={"xs"} startContent={<Icon source={iconSourceFor(data.saveState === "error" ? "retry" : "complete", "chip")} usage="chip" />}>{saveLabel}</Text></div> {/* vn-ok: localized Vietnamese interface copy. */}
            <div className={cvBuilderActionsClassName}><Button variant="primary" isPending={data.isCompiling} onPress={on?.compile}>{"Biên dịch PDF"}</Button>{data.previewUrl && <a href={data.previewUrl} target="_blank" rel="noreferrer" className={cvBuilderPdfLinkClassName}><Icon source={iconSourceFor("explore", "chip")} usage={"chip"} />Mở PDF</a>}</div> {/* vn-ok: localized Vietnamese interface copy. */}
        </header>
        {data.mutationMessage && <div className={cvBuilderFeedbackClassName}><Text size={"sm"} live={data.saveState === "error" ? "assertive" : "polite"}>{data.mutationMessage}</Text></div>}
        <div className={cvBuilderWorkspaceClassName}>
            <aside className={cvBuilderOutlineClassName} aria-label="Cấu trúc CV"><SurfaceCard composition="single"><div className={cvBuilderProgressClassName}><div className={cvBuilderProgressHeaderClassName}><Text size={"sm"}>{"Mức hoàn thiện"}</Text><Text weight={"semibold"}>{`${data.completeness}%`}</Text></div><div className={cvBuilderProgressTrackClassName} role="progressbar" aria-label="Mức hoàn thiện CV" aria-valuemin={0} aria-valuemax={100} aria-valuenow={data.completeness}><div className={cvBuilderProgressBarClassName} style={{ width: `${data.completeness}%` }} /></div><Text size={"xs"}>{data.completeness === 100 ? "Đủ dữ liệu cốt lõi để ứng tuyển." : "Hoàn thiện các mục cốt lõi trước khi công khai."}</Text></div><div className={cvBuilderOutlineListClassName}>{outline.map((item) => <div key={item.label} className={cvBuilderOutlineItemClassName}><span>{item.label}</span>{item.complete ? <Icon source={iconSourceFor("complete", "chip")} usage={"chip"} /> : <Text size={"xs"} tone={"muted"}>{"Chưa đủ"}</Text>}</div>)}</div><div className={cvBuilderSettingsClassName}><label htmlFor="cv-template" className={cvBuilderFieldClassName}>Mẫu CV<Select props={{ id: "cv-template", name: "template", label: "Mẫu CV", selectedKey: document.style.template ?? "classic", options: [{ id: "classic", label: "Cổ điển · ATS" }, { id: "modern", label: "Hiện đại" }, { id: "minimal", label: "Tối giản" }] }} on={{ select: (value) => on?.documentStyle?.("template", value) }} /></label><label htmlFor="cv-language" className={cvBuilderFieldClassName}>Ngôn ngữ<Select props={{ id: "cv-language", name: "language", label: "Ngôn ngữ", selectedKey: document.style.language ?? "vi", options: [{ id: "vi", label: "Tiếng Việt" }, { id: "en", label: "English" }] }} on={{ select: (value) => on?.documentStyle?.("language", value) }} /></label></div></SurfaceCard></aside> {/* vn-ok: localized Vietnamese interface copy. */}
            <section className={cvBuilderEditorClassName} aria-label="Trình soạn CV"><SurfaceCard composition="single"><div className={cvBuilderModeClassName} role="tablist" aria-label="Chế độ soạn CV"><button type="button" role="tab" aria-selected={data.mode === "blocks"} className={getCvBuilderModeButtonClassName(data.mode === "blocks")} onClick={() => on?.mode?.("blocks")}>Khối nội dung</button><button type="button" role="tab" aria-selected={data.mode === "latex"} className={getCvBuilderModeButtonClassName(data.mode === "latex")} onClick={() => on?.mode?.("latex")}>Mã LaTeX</button></div>{data.mode === "latex" ? <textarea aria-label="Mã nguồn LaTeX" value={data.texDraft} onChange={(event) => on?.tex?.(event.target.value)} className={cvBuilderTexClassName} /> : <div className={cvBuilderFormClassName}> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 1 · NỀN TẢNG" title="Thông tin cá nhân" description="Tạo phần đầu của CV và thông tin liên hệ." /><div className={cvBuilderFieldsClassName}><Field document={document} type="personal" name="name" label="Họ tên" placeholder="Nguyễn Văn A" on={on?.field} /><Field document={document} type="personal" name="role" label="Vị trí ứng tuyển" placeholder="Backend Developer" on={on?.field} /><Field document={document} type="personal" name="email" label="Email" placeholder="ban@email.com" on={on?.field} /><Field document={document} type="personal" name="phone" label="Số điện thoại" placeholder="0901 234 567" on={on?.field} /><Field document={document} type="personal" name="location" label="Nơi ở" placeholder="TP. Hồ Chí Minh" on={on?.field} /><Field document={document} type="personal" name="githubUsername" label="GitHub" placeholder="github.com/username" on={on?.field} /></div></section>
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 2 · ĐỊNH VỊ" title="Tóm tắt nghề nghiệp" description="AI chỉ đề xuất; bạn duyệt trước khi lưu." action={<Button variant="tertiary" size="sm" isPending={data.isRewriting} onPress={() => on?.rewrite?.("summary")}>{"AI viết giúp"}</Button>} /><div className={cvBuilderFieldsClassName}><ProseField document={document} type="summary" name="text" label="Tóm tắt bản thân" placeholder="Giới thiệu ngắn về kinh nghiệm và mục tiêu nghề nghiệp…" on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 3 · KINH NGHIỆM" title="Kinh nghiệm làm việc" action={<Button variant="tertiary" size="sm" isPending={data.isRewriting} onPress={() => on?.rewrite?.("experience")}>{"AI viết bullet"}</Button>} /><div className={cvBuilderFieldsClassName}><Field document={document} type="experience" name="company" label="Công ty" placeholder="Tên công ty" on={on?.field} /><Field document={document} type="experience" name="role" label="Vị trí" placeholder="Backend Developer" on={on?.field} /><Field document={document} type="experience" name="startDate" label="Bắt đầu" placeholder="Th01/2024" on={on?.field} /><Field document={document} type="experience" name="endDate" label="Kết thúc" placeholder="Hiện tại" on={on?.field} /><ProseField document={document} type="experience" name="bullets" label="Kết quả nổi bật" placeholder="Mỗi dòng là một kết quả có hành động và số liệu…" rows={5} on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 4 · BẰNG CHỨNG" title="Dự án" description="Dự án StarCi đã vượt qua có thể dùng làm bằng chứng xác thực." action={<Button variant="tertiary" size="sm" isPending={data.isRewriting} onPress={() => on?.rewrite?.("project")}>{"AI làm rõ tác động"}</Button>} /><div className={cvBuilderFieldsClassName}><Field document={document} type="project" name="title" label="Tên dự án" placeholder="StarCi Shop API" on={on?.field} /><Field document={document} type="project" name="description" label="Mô tả" placeholder="Vai trò, công nghệ và kết quả…" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 5 · NĂNG LỰC" title="Kỹ năng" /><div className={cvBuilderFieldsClassName}><Field document={document} type="skills" name="skillsText" label="Danh sách kỹ năng" placeholder="TypeScript, NestJS, PostgreSQL, Docker" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BƯỚC 6 · HỌC VẤN" title="Học vấn" /><div className={cvBuilderFieldsClassName}><Field document={document} type="education" name="school" label="Trường" placeholder="Tên trường" on={on?.field} /><Field document={document} type="education" name="degree" label="Bằng cấp / chuyên ngành" placeholder="Kỹ thuật phần mềm" on={on?.field} /><Field document={document} type="education" name="startDate" label="Bắt đầu" placeholder="2019" on={on?.field} /><Field document={document} type="education" name="endDate" label="Kết thúc" placeholder="2023" on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
                <section className={cvBuilderSectionClassName}><SectionHeader eyebrow="BỔ SUNG · LEGACY" title="Điểm khác biệt" description="Các mục tùy chọn từ CV StarCi cũ; để trống nếu không cần." /><div className={cvBuilderFieldsClassName}><Field document={document} type="achievement" name="title" label="Thành tích" placeholder="Giải thưởng hoặc cột mốc" on={on?.field} /><Field document={document} type="certification" name="title" label="Chứng chỉ" placeholder="Tên chứng chỉ" on={on?.field} /><Field document={document} type="language" name="name" label="Ngoại ngữ" placeholder="English · B2" on={on?.field} /><Field document={document} type="activity" name="description" label="Hoạt động" placeholder="Cộng đồng hoặc tình nguyện" on={on?.field} /><Field document={document} type="interest" name="name" label="Sở thích" placeholder="Đọc sách, chạy bộ…" wide on={on?.field} /></div></section> {/* vn-ok: localized Vietnamese interface copy. */}
            </div>}</SurfaceCard></section>
            <aside className={cvBuilderPreviewClassName} aria-label="Bản xem trước CV"><SurfaceCard composition="single"><div className={cvBuilderPreviewHeaderClassName}><div><Heading level={3}>{"Bản xem trước"}</Heading><Text size={"xs"}>{data.previewUrl ? "PDF đã biên dịch" : "Bản nháp ATS · A4"}</Text></div><Button variant="secondary" size="sm" isPending={data.isCompiling} onPress={on?.compile}>{"Biên dịch lại"}</Button></div>{data.previewUrl ? <ProfileCvDocument props={{ title: document.label, src: data.previewUrl }} /> : <div className={cvBuilderPaperStageClassName}><DraftPaper document={document} /></div>}</SurfaceCard></aside> {/* vn-ok: localized Vietnamese interface copy. */}
        </div>
    </div>
}
