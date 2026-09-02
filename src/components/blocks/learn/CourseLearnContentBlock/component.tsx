import { EmptyNotice } from "@starci/grammar/common"
import { Heading } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import type { LearnMobileView } from "@/components/product-shells/LearnShellLayout/component"
import type { ReactionType } from "@/modules/api/graphql/queries/types/reactions"
/** One face of a content tab. */
export type ContentFace = { readonly id: string; readonly label: string }
/** One way on from this content. */
export type ContentNextStep = { readonly id: string; readonly label: string; readonly isComplete?: boolean }
/** One place inside the content outline. */
export type ContentOutlineEntry = { readonly id: string; readonly label: string; readonly isCurrent?: boolean; readonly depth?: 1 | 2 | 3 }
/** Compatibility state name for the content reader. */
export type CourseLearnContentBlockState = "pending" | "ready" | "locked" | "failed"
/** Every resolved string the reader renders. */
export type CourseLearnContentBlockLabels = { readonly navCourse: string; readonly navModule: string; readonly facesLabel: string; readonly searchPlaceholder: string; readonly searchLabel: string; readonly searchClearLabel: string; readonly resizeRail: string; readonly outlineTitle: string; readonly pageLabel: string; readonly previousLabel: string; readonly nextLabel: string; readonly reactionsLabel: string; readonly reactionPrompt: string; readonly nextTitle: string }
/** Resolved content page data. */
export type CourseLearnContentBlockData = { readonly labels: CourseLearnContentBlockLabels; readonly title?: string; readonly description?: string; readonly body?: string; readonly noticeMessage?: string; readonly noticeActionLabel?: string; readonly [key: string]: unknown }
/** Navigation and content events. */
export type CourseLearnContentBlockActions = { readonly [key: string]: unknown; readonly selectReading?: () => void; readonly selectSource?: () => void; readonly selectChallenge?: () => void; readonly selectLanguage?: (language: string) => void; readonly changePage?: (page: number) => void; readonly selectReaction?: (reaction: ReactionType | null) => void; readonly changeDiscussionDraft?: (value: string) => void; readonly submitDiscussion?: () => void; readonly retryDiscussion?: () => void; readonly searchContent?: (query: string) => void; readonly toggleModule?: (moduleId: string, isOpen: boolean) => void; readonly openContent?: (contentId: string) => void; readonly act?: () => void; readonly goCourse?: () => void; readonly goModule?: () => void }
/** Props for the pure content reader. */
export type CourseLearnContentBlockProps = { readonly blockState: CourseLearnContentBlockState; readonly props: CourseLearnContentBlockData; readonly on?: CourseLearnContentBlockActions; readonly mobileView?: Extract<LearnMobileView, "contents" | "lesson" | "outline"> }
/** Draw one content reader with semantic React markup. */
export const CourseLearnContentBlockBase = (props: CourseLearnContentBlockProps) => {
    const loading = props.blockState === "pending"
    const title = props.props.title ?? ""
    const notice = props.blockState === "failed" || props.blockState === "locked"
    return <main aria-label={title}><Heading level={1} isSkeleton={loading}>{title}</Heading>{props.props.description === undefined ? null : <Text size={"sm"} tone={"muted"}>{props.props.description}</Text>}{notice ? <EmptyNotice message={props.props.noticeMessage ?? ""} actionLabel={props.props.noticeActionLabel} onAction={({ act: props.on?.act })?.act} /> : <article><Text size={"md"} isSkeleton={loading}>{props.props.body ?? ""}</Text></article>}</main>
}
