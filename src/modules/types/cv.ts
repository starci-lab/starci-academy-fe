/** Closed set of block types persisted in `cv_blocks.blocks`. */
export type CvBlockType = "personal" | "summary" | "experience" | "education" | "skills" | "project" | "achievement" | "certification" | "language" | "activity" | "interest"

/** One flexible item inside a typed CV block. */
export type CvBlockItem = {
    readonly id: string
    readonly source?: "verified" | "self"
    readonly sourceRef?: string
    readonly fields: Readonly<Record<string, unknown>>
}

/** One ordered section in the block editor. */
export type CvBlock = {
    readonly id: string
    readonly type: CvBlockType
    readonly title: string
    readonly order: number
    readonly items: ReadonlyArray<CvBlockItem>
}

/** Visual and language choices shared by block and LaTeX modes. */
export type CvStyle = {
    readonly font: string
    readonly accent: string
    readonly fontScale?: "sm" | "md" | "lg"
    readonly language?: "vi" | "en"
    readonly template?: "classic" | "modern" | "sidebar" | "minimal"
}

/** One persisted CV document owned by the signed-in learner. */
export type CvDocument = {
    readonly id: string
    readonly label: string
    readonly blocks: ReadonlyArray<CvBlock>
    readonly style: CvStyle
    readonly pdfCdnKey: string | null
    readonly createdAt: string
    readonly updatedAt: string
}

/** StarCi-native defaults for a newly created developer CV. */
export const DEFAULT_CV_STYLE: CvStyle = {
    font: "inter",
    accent: "#7547FF",
    fontScale: "md",
    language: "vi",
    template: "classic",
}

const starterItem = (fields: Readonly<Record<string, unknown>> = {}): CvBlockItem => ({
    id: crypto.randomUUID(),
    fields,
})

/** Creates the high-value legacy block set without inventing user facts. */
export const createStarterCvBlocks = (): ReadonlyArray<CvBlock> => [
    { id: crypto.randomUUID(), type: "personal", title: "Thông tin cá nhân", order: 0, items: [starterItem()] }, // vn-ok: localized Vietnamese CV schema title.
    { id: crypto.randomUUID(), type: "summary", title: "Tóm tắt", order: 1, items: [starterItem()] }, // vn-ok: localized Vietnamese CV schema title.
    { id: crypto.randomUUID(), type: "experience", title: "Kinh nghiệm", order: 2, items: [starterItem()] }, // vn-ok: localized Vietnamese CV schema title.
    { id: crypto.randomUUID(), type: "project", title: "Dự án", order: 3, items: [starterItem()] }, // vn-ok: localized Vietnamese CV schema title.
    { id: crypto.randomUUID(), type: "skills", title: "Kỹ năng", order: 4, items: [] }, // vn-ok: localized Vietnamese CV schema title.
    { id: crypto.randomUUID(), type: "education", title: "Học vấn", order: 5, items: [starterItem()] }, // vn-ok: localized Vietnamese CV schema title.
]
