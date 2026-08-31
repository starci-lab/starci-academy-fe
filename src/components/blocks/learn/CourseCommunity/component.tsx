import { PrimaryRailLayout, SectionHeader, Tabs } from "@starci/grammar/core"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Breadcrumbs, type BreadcrumbStep } from "@/components/leaves/Breadcrumbs"
import { Button } from "@/components/leaves/Button"
import { ConfirmButton } from "@/components/leaves/ConfirmButton"
import { SearchBox } from "@/components/leaves/SearchBox"
import { Text } from "@/components/leaves/Text"
import { Textarea } from "@/components/leaves/Textarea"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import {
    communityActionsClassName,
    communityAuthorClassName,
    communityAuthorCopyClassName,
    communityAuthorRowClassName,
    communityBackClassName,
    communityBodyClassName,
    communityCommentContentClassName,
    communityCommentListClassName,
    communityComposerClassName,
    communityComposerFooterClassName,
    communityFactClassName,
    communityFactListClassName,
    communityFatalClassName,
    communityFiltersClassName,
    communityGuidanceClassName,
    getCommunityCommentClassName,
    communityHeaderClassName,
    communityInlineErrorClassName,
    communityOwnerActionsClassName,
    communityPageClassName,
    communityPostClassName,
    communityPostListClassName,
    communityPrimaryClassName,
    communityRailClassName,
    communityReplyClassName,
    communityStaleNoticeClassName,
    communityToolbarClassName,
} from "./classNames"

/** Viewer-aware reaction summary returned by the course-qualified API. */
export type CourseCommunityReaction = { readonly total: number; readonly myReaction: string | null }
/** One post shaped for the Course Community surface. */
export type CourseCommunityPostRow = {
    readonly id: string
    readonly body: string
    readonly authorName: string
    readonly authorAvatar?: string
    readonly createdLabel: string
    readonly editedLabel?: string
    readonly commentCount: number
    readonly reactions: CourseCommunityReaction
    readonly isMine: boolean
}
/** One top-level comment or direct reply. */
export type CourseCommunityCommentRow = {
    readonly id: string
    readonly body: string
    readonly authorName: string
    readonly authorAvatar?: string
    readonly createdLabel: string
    readonly editedLabel?: string
    readonly replyCount: number
    readonly reactions: CourseCommunityReaction
    readonly isMine: boolean
    readonly parentCommentId?: string
}
/** Whole route states with error precedence over empty. */
export type CourseCommunityState = "pending" | "ready" | "empty" | "failed" | "forbidden"
/** Feed and post-detail projections of the same course-owned feature. */
export type CourseCommunityMode = "feed" | "detail"

type CourseCommunityCopy = {
    readonly title: string
    readonly subtitle: string
    readonly courseName: string
    readonly trail: ReadonlyArray<BreadcrumbStep>
    readonly searchPlaceholder: string
    readonly searchLabel: string
    readonly clearSearchLabel: string
    readonly allLabel: string
    readonly mineLabel: string
    readonly composerLabel: string
    readonly composerPlaceholder: string
    readonly composerHint: string
    readonly publishLabel: string
    readonly postsLabel: string
    readonly commentsLabel: string
    readonly commentPlaceholder: string
    readonly commentLabel: string
    readonly replyLabel: string
    readonly replyPlaceholder: string
    readonly likeLabel: string
    readonly unlikeLabel: string
    readonly commentsCount: (count: number) => string
    readonly repliesCount: (count: number) => string
    readonly reactionCount: (count: number) => string
    readonly emptyLabel: string
    readonly filteredEmptyLabel: string
    readonly failedLabel: string
    readonly failedTitle: string
    readonly forbiddenLabel: string
    readonly forbiddenTitle: string
    readonly unavailableLabel: string
    readonly retryLabel: string
    readonly openCourseLabel: string
    readonly clearCriteriaLabel: string
    readonly loadMoreLabel: string
    readonly backLabel: string
    readonly editLabel: string
    readonly saveLabel: string
    readonly cancelLabel: string
    readonly deleteLabel: string
    readonly confirmDeleteLabel: string
    readonly mineBadge: string
    readonly activityLabel: string
    readonly postsFactLabel: string
    readonly commentsFactLabel: string
    readonly guidanceLabel: string
    readonly guidance: ReadonlyArray<string>
}

/** Pure view input; the connected block owns data, idempotency and recovery. */
export type CourseCommunityProps = {
    readonly mode: CourseCommunityMode
    readonly state: CourseCommunityState
    readonly copy: CourseCommunityCopy
    readonly filter: "all" | "mine"
    readonly query: string
    readonly posts: ReadonlyArray<CourseCommunityPostRow>
    readonly post?: CourseCommunityPostRow
    readonly comments: ReadonlyArray<CourseCommunityCommentRow>
    readonly replies: ReadonlyArray<CourseCommunityCommentRow>
    readonly expandedParentId?: string
    readonly draft: string
    readonly commentDraft: string
    readonly replyDraft: string
    readonly editingPostBody?: string
    readonly editingCommentId?: string
    readonly editingCommentBody?: string
    readonly createError?: string
    readonly commentError?: string
    readonly staleError?: string
    readonly isCreating?: boolean
    readonly isCommenting?: boolean
    readonly isLoadingMore?: boolean
    readonly hasMore?: boolean
    readonly authoredPostCount?: number
    readonly authoredCommentCount?: number
    readonly on: {
        readonly openCourse?: () => void
        readonly search?: (query: string) => void
        readonly filter?: (filter: "all" | "mine") => void
        readonly changeDraft?: (value: string) => void
        readonly publish?: () => void
        readonly openPost?: (postId: string) => void
        readonly retry?: () => void
        readonly clearCriteria?: () => void
        readonly loadMore?: () => void
        readonly back?: () => void
        readonly reactPost?: (postId: string, active: boolean) => void
        readonly changeCommentDraft?: (value: string) => void
        readonly comment?: () => void
        readonly expandReplies?: (commentId: string) => void
        readonly changeReplyDraft?: (value: string) => void
        readonly reply?: (commentId: string) => void
        readonly reactComment?: (commentId: string, active: boolean) => void
        readonly beginEditPost?: () => void
        readonly changeEditPost?: (value: string) => void
        readonly savePost?: () => void
        readonly cancelEditPost?: () => void
        readonly deletePost?: () => void
        readonly beginEditComment?: (commentId: string, body: string) => void
        readonly changeEditComment?: (value: string) => void
        readonly saveComment?: (commentId: string) => void
        readonly cancelEditComment?: () => void
        readonly deleteComment?: (commentId: string) => void
    }
}

type PostActionsProps = { readonly post: CourseCommunityPostRow; readonly copy: CourseCommunityCopy; readonly on: CourseCommunityProps["on"] }
type PostRowProps = PostActionsProps & { readonly detail?: boolean }
type CommentRowProps = { readonly comment: CourseCommunityCommentRow; readonly copy: CourseCommunityCopy; readonly on: CourseCommunityProps["on"]; readonly reply?: boolean; readonly isEditing?: boolean; readonly editingBody?: string }

const PostActions = ({ post, copy, on }: PostActionsProps) => (
    <div className={communityActionsClassName}>
        <Button props={{ label: post.reactions.myReaction === null ? copy.likeLabel : copy.unlikeLabel, variant: "ghost", size: "sm" }} on={{ press: () => on.reactPost?.(post.id, post.reactions.myReaction !== null) }} />
        <Text props={{ content: copy.reactionCount(post.reactions.total), size: "xs" }} />
        <Button props={{ label: copy.commentsCount(post.commentCount), variant: "ghost", size: "sm" }} on={{ press: () => on.openPost?.(post.id) }} />
    </div>
)

const PostRow = ({ post, copy, on, detail = false }: PostRowProps) => (
    <article className={communityPostClassName} aria-label={post.authorName}>
        <div className={communityAuthorRowClassName}>
            <div className={communityAuthorClassName}><Avatar props={{ name: post.authorName, src: post.authorAvatar, size: "sm" }} /><div className={communityAuthorCopyClassName}><Text props={{ content: post.authorName, size: "sm", weight: "semibold" }} /><Text props={{ content: `${post.createdLabel}${post.editedLabel === undefined ? "" : ` · ${post.editedLabel}`}`, size: "xs" }} /></div></div>
            {post.isMine ? <Badge props={{ content: copy.mineBadge, tone: "accent" }} /> : null}
        </div>
        <p className={communityBodyClassName}>{post.body}</p>
        <PostActions post={post} copy={copy} on={on} />
        {detail && post.isMine ? <div className={communityOwnerActionsClassName}><Button props={{ label: copy.editLabel, variant: "secondary", size: "sm" }} on={{ press: on.beginEditPost }} /><ConfirmButton props={{ label: copy.deleteLabel, confirmLabel: copy.confirmDeleteLabel }} on={{ confirm: on.deletePost }} /></div> : null}
    </article>
)

const CommentRow = ({ comment, copy, on, reply = false, isEditing = false, editingBody = "" }: CommentRowProps) => (
    <li className={getCommunityCommentClassName(reply)}>
        <Avatar props={{ name: comment.authorName, src: comment.authorAvatar, size: "sm" }} />
        <div className={communityCommentContentClassName}>
            <div className={communityAuthorRowClassName}><div className={communityAuthorCopyClassName}><Text props={{ content: comment.authorName, size: "sm", weight: "semibold" }} /><Text props={{ content: `${comment.createdLabel}${comment.editedLabel === undefined ? "" : ` · ${comment.editedLabel}`}`, size: "xs" }} /></div>{comment.isMine ? <Badge props={{ content: copy.mineBadge, tone: "accent" }} /> : null}</div>
            {isEditing ? <><Textarea key={comment.id} props={{ id: `edit-${comment.id}`, name: `edit-${comment.id}`, label: copy.editLabel, defaultValue: editingBody, rows: 3 }} on={{ change: on.changeEditComment }} /><div className={communityOwnerActionsClassName}><Button props={{ label: copy.saveLabel, variant: "primary", size: "sm", disabled: editingBody.trim() === "" }} on={{ press: () => on.saveComment?.(comment.id) }} /><Button props={{ label: copy.cancelLabel, variant: "ghost", size: "sm" }} on={{ press: on.cancelEditComment }} /></div></> : <p className={communityBodyClassName}>{comment.body}</p>}
            <div className={communityActionsClassName}><Button props={{ label: comment.reactions.myReaction === null ? copy.likeLabel : copy.unlikeLabel, variant: "ghost", size: "sm" }} on={{ press: () => on.reactComment?.(comment.id, comment.reactions.myReaction !== null) }} /><Text props={{ content: copy.reactionCount(comment.reactions.total), size: "xs" }} />{reply ? null : <Button props={{ label: comment.replyCount > 0 ? copy.repliesCount(comment.replyCount) : copy.replyLabel, variant: "ghost", size: "sm" }} on={{ press: () => on.expandReplies?.(comment.id) }} />}</div>
            {comment.isMine && !isEditing ? <div className={communityOwnerActionsClassName}><Button props={{ label: copy.editLabel, variant: "secondary", size: "sm" }} on={{ press: () => on.beginEditComment?.(comment.id, comment.body) }} /><ConfirmButton props={{ label: copy.deleteLabel, confirmLabel: copy.confirmDeleteLabel }} on={{ confirm: () => on.deleteComment?.(comment.id) }} /></div> : null}
        </div>
    </li>
)

/** Render feed, detail, pending, empty, stale and recovery states through published Grammar composition. */
export const CourseCommunityBase = (props: CourseCommunityProps) => {
    const loading = props.state === "pending"
    const filteredEmpty = props.state === "empty" && (props.query !== "" || props.filter === "mine")
    const fatalNotice = props.state === "failed" || props.state === "forbidden"
    const rail = <div className={communityRailClassName}>
        <SurfaceCard props={{ label: props.copy.activityLabel }} isLoading={loading}><div className={communityFactListClassName}><div className={communityFactClassName}><Text props={{ content: props.copy.postsFactLabel, size: "sm" }} /><Text props={{ content: String(props.authoredPostCount ?? 0), size: "sm", weight: "semibold" }} isLoading={loading} /></div><div className={communityFactClassName}><Text props={{ content: props.copy.commentsFactLabel, size: "sm" }} /><Text props={{ content: String(props.authoredCommentCount ?? 0), size: "sm", weight: "semibold" }} isLoading={loading} /></div></div></SurfaceCard>
        <SurfaceCard props={{ label: props.copy.guidanceLabel }}><ul className={communityGuidanceClassName}>{props.copy.guidance.map((line) => <li key={line}>{line}</li>)}</ul></SurfaceCard>
    </div>
    const composer = <SurfaceCard><div className={communityComposerClassName}><Textarea key={props.draft === "" ? "empty" : "retained"} props={{ id: "course-community-post", name: "course-community-post", label: props.copy.composerLabel, placeholder: props.copy.composerPlaceholder, defaultValue: props.draft, rows: 4, disabled: props.isCreating }} on={{ change: props.on.changeDraft }} />{props.createError === undefined ? null : <div className={communityInlineErrorClassName} role="alert">{props.createError}</div>}<div className={communityComposerFooterClassName}><Text props={{ content: props.copy.composerHint, size: "xs" }} /><Button props={{ label: props.copy.publishLabel, variant: "primary", icon: "send", isPending: props.isCreating, disabled: props.draft.trim() === "" }} on={{ press: props.on.publish }} /></div></div></SurfaceCard>
    const feed = <div className={communityPrimaryClassName}>
        {fatalNotice ? <div className={communityFatalClassName}><SurfaceCard props={{ label: props.state === "failed" ? props.copy.failedTitle : props.copy.forbiddenTitle }}><EmptyNotice props={{ icon: props.state === "failed" ? "retry" : "community", message: props.state === "failed" ? props.copy.failedLabel : props.copy.forbiddenLabel, actionLabel: props.state === "failed" ? props.copy.retryLabel : props.copy.openCourseLabel, actionIcon: props.state === "failed" ? "retry" : "back" }} on={{ act: props.state === "failed" ? props.on.retry : props.on.openCourse }} /></SurfaceCard></div> : <>
            {composer}
            <div className={communityToolbarClassName}><SearchBox props={{ placeholder: props.copy.searchPlaceholder, label: props.copy.searchLabel, clearLabel: props.copy.clearSearchLabel }} on={{ search: props.on.search }} /><div className={communityFiltersClassName}><Tabs label={props.copy.postsLabel} selectedKey={props.filter} labelVisibility="always" items={[{ id: "all", label: props.copy.allLabel }, { id: "mine", label: props.copy.mineLabel }]} onSelect={(key) => props.on.filter?.(key === "mine" ? "mine" : "all")} /></div></div>
            {props.staleError === undefined ? null : <div className={communityStaleNoticeClassName} role="status"><span>{props.staleError}</span><Button props={{ label: props.copy.retryLabel, variant: "secondary", size: "sm" }} on={{ press: props.on.retry }} /></div>}
            {props.state === "empty" ? <EmptyNotice props={{ icon: "community", message: filteredEmpty ? props.copy.filteredEmptyLabel : props.copy.emptyLabel, actionLabel: filteredEmpty ? props.copy.clearCriteriaLabel : undefined }} on={{ act: props.on.clearCriteria }} /> : <SurfaceListCard props={{ label: props.copy.postsLabel, actionLabel: props.hasMore ? props.copy.loadMoreLabel : undefined }} isLoading={loading} on={{ act: props.on.loadMore }}><ul className={communityPostListClassName}>{props.posts.map((post) => <li key={post.id}><PostRow post={post} copy={props.copy} on={props.on} /></li>)}</ul>{props.isLoadingMore ? <Text props={{ content: props.copy.loadMoreLabel, size: "sm", live: "polite" }} isLoading /> : null}</SurfaceListCard>}
        </>}
    </div>
    const detail = <div className={communityPrimaryClassName}>
        <div className={communityBackClassName}><Button props={{ label: props.copy.backLabel, icon: "back", variant: "ghost", size: "sm" }} on={{ press: props.on.back }} /></div>
        {fatalNotice ? <EmptyNotice props={{ icon: props.state === "failed" ? "retry" : "community", message: props.state === "failed" ? props.copy.failedLabel : props.copy.unavailableLabel, actionLabel: props.state === "failed" ? props.copy.retryLabel : props.copy.backLabel }} on={{ act: props.state === "failed" ? props.on.retry : props.on.back }} /> : props.post === undefined ? <SurfaceCard isLoading><div className={communityPostClassName}><Text props={{ content: props.copy.postsLabel }} isLoading /><Text props={{ content: props.copy.subtitle }} isLoading /></div></SurfaceCard> : <>
            <SurfaceCard>{props.editingPostBody === undefined ? <PostRow post={props.post} copy={props.copy} on={props.on} detail /> : <div className={communityComposerClassName}><Textarea key={props.post.id} props={{ id: "edit-course-community-post", name: "edit-course-community-post", label: props.copy.editLabel, defaultValue: props.editingPostBody, rows: 5 }} on={{ change: props.on.changeEditPost }} /><div className={communityOwnerActionsClassName}><Button props={{ label: props.copy.saveLabel, variant: "primary", disabled: props.editingPostBody.trim() === "" }} on={{ press: props.on.savePost }} /><Button props={{ label: props.copy.cancelLabel, variant: "ghost" }} on={{ press: props.on.cancelEditPost }} /></div></div>}</SurfaceCard>
            <SurfaceCard><div className={communityComposerClassName}><Textarea key={props.commentDraft === "" ? "empty" : "retained"} props={{ id: "course-community-comment", name: "course-community-comment", label: props.copy.commentLabel, placeholder: props.copy.commentPlaceholder, defaultValue: props.commentDraft, rows: 3, disabled: props.isCommenting }} on={{ change: props.on.changeCommentDraft }} />{props.commentError === undefined ? null : <div className={communityInlineErrorClassName} role="alert">{props.commentError}</div>}<div className={communityComposerFooterClassName}><span /><Button props={{ label: props.copy.commentLabel, variant: "primary", isPending: props.isCommenting, disabled: props.commentDraft.trim() === "" }} on={{ press: props.on.comment }} /></div></div></SurfaceCard>
            <SurfaceListCard props={{ label: props.copy.commentsLabel }} isLoading={loading}><ul className={communityCommentListClassName}>{props.comments.length === 0 && !loading ? <li><EmptyNotice props={{ message: props.copy.emptyLabel }} /></li> : props.comments.flatMap((comment) => {
                const row = <CommentRow key={comment.id} comment={comment} copy={props.copy} on={props.on} isEditing={props.editingCommentId === comment.id} editingBody={props.editingCommentBody} />
                if (props.expandedParentId !== comment.id) return [row]
                return [row, ...props.replies.map((reply) => <CommentRow key={reply.id} comment={reply} copy={props.copy} on={props.on} reply isEditing={props.editingCommentId === reply.id} editingBody={props.editingCommentBody} />), <li className={communityReplyClassName} key={`${comment.id}-reply`}><div className={communityComposerClassName}><Textarea key={props.replyDraft === "" ? "empty" : "retained"} props={{ id: `reply-${comment.id}`, name: `reply-${comment.id}`, label: props.copy.replyLabel, placeholder: props.copy.replyPlaceholder, defaultValue: props.replyDraft, rows: 2, disabled: props.isCommenting }} on={{ change: props.on.changeReplyDraft }} /><Button props={{ label: props.copy.replyLabel, variant: "primary", size: "sm", isPending: props.isCommenting, disabled: props.replyDraft.trim() === "" }} on={{ press: () => props.on.reply?.(comment.id) }} /></div></li>]
            })}</ul></SurfaceListCard>
        </>}
    </div>
    return <main className={communityPageClassName} aria-label={props.copy.title}>
        <header className={communityHeaderClassName}><Breadcrumbs props={{ steps: props.copy.trail, label: props.copy.title }} on={{ course: props.on.openCourse }} /><SectionHeader composition="context-intro" level={1} eyebrow={props.copy.courseName} title={props.copy.title} description={props.copy.subtitle} /></header>
        <PrimaryRailLayout primary={props.mode === "feed" ? feed : detail} rail={fatalNotice ? undefined : rail} railWidth={fatalNotice ? undefined : "compact"} />
    </main>
}
