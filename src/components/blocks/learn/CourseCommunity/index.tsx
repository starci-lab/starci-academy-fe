"use client"

import { useEffect, useMemo, useState } from "react"
import { gql } from "@apollo/client"
import { useLocale } from "next-intl"
import useSWR from "swr"
import useSWRInfinite from "swr/infinite"
import { useViewerKey } from "@/hooks/auth/useViewerKey"
import { useRouter } from "@/i18n/navigation"
import { createApolloClient } from "@/modules/api/graphql/clients/create-apollo-client"
import { CourseCommunityBase, type CourseCommunityCommentRow, type CourseCommunityPostRow } from "./component"

/** Route identity for either the course feed or one course-owned post. */
export type CourseCommunityProps = { readonly displayId: string; readonly postId?: string }

type CommunityAuthor = { readonly username: string; readonly avatar: string | null }
type CommunityReaction = { readonly total: number; readonly myReaction: string | null }
type CommunityPostNode = { readonly id: string; readonly body: string; readonly isDeleted: boolean; readonly editedAt: string | null; readonly createdAt: string; readonly author: CommunityAuthor; readonly commentCount: number; readonly reactions: CommunityReaction; readonly isMine: boolean }
type CommunityCommentNode = { readonly id: string; readonly body: string; readonly isDeleted: boolean; readonly editedAt: string | null; readonly createdAt: string; readonly parentCommentId: string | null; readonly author: CommunityAuthor; readonly replyCount: number; readonly reactions: CommunityReaction; readonly isMine: boolean }
type CommunityFeedPage = { readonly posts: ReadonlyArray<CommunityPostNode>; readonly nextCursor: string | null }
type CommunityCommentsPage = { readonly comments: ReadonlyArray<CommunityCommentNode>; readonly nextCursor: string | null }
type FeedKey = readonly ["COURSE_COMMUNITY_FEED", string, string, "all" | "mine", string, string]
type DetailKey = readonly ["COURSE_COMMUNITY_DETAIL", string, string, string]
type CommentsKey = readonly ["COURSE_COMMUNITY_COMMENTS", string, string, string, string]

const POST_FIELDS = gql`
    fragment CourseCommunityPostFields on CourseCommunityPostNode {
        id body isDeleted editedAt createdAt commentCount isMine
        author { username avatar }
        reactions { total myReaction }
    }
`
const COMMENT_FIELDS = gql`
    fragment CourseCommunityCommentFields on CourseCommunityCommentNode {
        id body isDeleted editedAt createdAt parentCommentId replyCount isMine
        author { username avatar }
        reactions { total myReaction }
    }
`
const FEED_QUERY = gql`${POST_FIELDS} query CourseCommunityFeed($request: CourseCommunityFeedRequest!) { courseCommunityFeed(request: $request) { posts { ...CourseCommunityPostFields } nextCursor } }`
const DETAIL_QUERY = gql`${POST_FIELDS} query CourseCommunityPost($request: CourseCommunityPostRequest!) { courseCommunityPost(request: $request) { ...CourseCommunityPostFields } }`
const COMMENTS_QUERY = gql`${COMMENT_FIELDS} query CourseCommunityComments($request: CourseCommunityCommentsRequest!) { courseCommunityPostComments(request: $request) { comments { ...CourseCommunityCommentFields } nextCursor } }`
const CREATE_POST = gql`${POST_FIELDS} mutation CreateCourseCommunityPost($request: CreateCourseCommunityPostRequest!) { createCourseCommunityPost(request: $request) { ...CourseCommunityPostFields } }`
const UPDATE_POST = gql`${POST_FIELDS} mutation UpdateCourseCommunityPost($request: MutateCourseCommunityPostRequest!) { updateCourseCommunityPost(request: $request) { ...CourseCommunityPostFields } }`
const DELETE_POST = gql`${POST_FIELDS} mutation DeleteCourseCommunityPost($request: MutateCourseCommunityPostRequest!) { deleteCourseCommunityPost(request: $request) { ...CourseCommunityPostFields } }`
const REACT_POST = gql`${POST_FIELDS} mutation ReactToCourseCommunityPost($request: ReactCourseCommunityPostRequest!) { reactToCourseCommunityPost(request: $request) { ...CourseCommunityPostFields } }`
const CREATE_COMMENT = gql`${COMMENT_FIELDS} mutation CreateCourseCommunityComment($request: CreateCourseCommunityCommentRequest!) { createCourseCommunityPostComment(request: $request) { ...CourseCommunityCommentFields } }`
const UPDATE_COMMENT = gql`${COMMENT_FIELDS} mutation UpdateCourseCommunityComment($request: MutateCourseCommunityCommentRequest!) { updateCourseCommunityPostComment(request: $request) { ...CourseCommunityCommentFields } }`
const DELETE_COMMENT = gql`${COMMENT_FIELDS} mutation DeleteCourseCommunityComment($request: MutateCourseCommunityCommentRequest!) { deleteCourseCommunityPostComment(request: $request) { ...CourseCommunityCommentFields } }`
const REACT_COMMENT = gql`${COMMENT_FIELDS} mutation ReactToCourseCommunityComment($request: ReactCourseCommunityCommentRequest!) { reactToCourseCommunityComment(request: $request) { ...CourseCommunityCommentFields } }`

const COPY = {
    en: {
        title: "Course Community", subtitle: "Share progress, compare approaches, and learn with people in this course.", course: "Course", openCourse: "Back to course", all: "All posts", mine: "My posts", composer: "Start a discussion", composerPlaceholder: "What did you discover, try, or need another perspective on?", composerHint: "Keep course questions in Q&A so answers remain easy to find.", publish: "Publish", posts: "Discussions", comments: "Comments", commentPlaceholder: "Add a constructive response", comment: "Comment", reply: "Reply", replyPlaceholder: "Write a reply", like: "Like", unlike: "Unlike", empty: "No discussions yet. Start the first one.", filteredEmpty: "No discussions match these criteria.", failedTitle: "Community unavailable", failed: "Community could not be loaded.", forbiddenTitle: "Community access required", forbidden: "You need active access to this course to join its Community.", unavailable: "This discussion is unavailable in this course.", retry: "Try again", clear: "Clear filters", loadMore: "Load more", back: "Back to Community", edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete", confirmDelete: "Press again to delete", mineBadge: "Yours", activity: "Current view", postsFact: "Posts loaded", commentsFact: "Comments loaded", guidanceLabel: "Good discussion", guidance: ["Share context and what you already tried.", "Challenge ideas, not people.", "Use Course Q&A for questions needing an authoritative answer."], search: "Search course discussions", clearSearch: "Clear discussion search", createError: "Your post was not published. Your text is still here.", commentError: "Your response was not published. Your text is still here.", staleError: "The latest update failed. Existing discussions are still available.", edited: "Edited", deletedBody: "This contribution was deleted.",
    },
    vi: {
        title: "Cộng đồng khóa học", subtitle: "Chia sẻ tiến độ, đối chiếu cách làm và học cùng những người trong khóa này.", course: "Khóa học", all: "Tất cả bài viết", mine: "Bài của tôi", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        composer: "Mở một cuộc thảo luận", composerPlaceholder: "Bạn vừa khám phá, thử nghiệm điều gì hoặc cần thêm góc nhìn nào?", composerHint: "Các câu hỏi về bài học nên đặt ở Hỏi đáp để câu trả lời dễ được tìm lại.", publish: "Đăng bài", posts: "Thảo luận", comments: "Bình luận", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        commentPlaceholder: "Đóng góp một phản hồi hữu ích", comment: "Bình luận", reply: "Trả lời", replyPlaceholder: "Viết câu trả lời", like: "Thích", unlike: "Bỏ thích", empty: "Chưa có thảo luận. Hãy mở cuộc trò chuyện đầu tiên.", filteredEmpty: "Không có thảo luận phù hợp với tiêu chí này.", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        failedTitle: "Cộng đồng chưa khả dụng", failed: "Không tải được Cộng đồng khóa học.", forbiddenTitle: "Cần quyền truy cập Cộng đồng", forbidden: "Bạn cần quyền truy cập còn hiệu lực vào khóa học để tham gia Cộng đồng.", unavailable: "Thảo luận này không khả dụng trong khóa học.", retry: "Thử lại", openCourse: "Về khóa học", clear: "Xóa bộ lọc", loadMore: "Tải thêm", back: "Quay lại Cộng đồng", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        edit: "Chỉnh sửa", save: "Lưu", cancel: "Hủy", delete: "Xóa", confirmDelete: "Nhấn lần nữa để xóa", mineBadge: "Của bạn", activity: "Nội dung đang xem", postsFact: "Bài đã tải", commentsFact: "Bình luận đã tải", guidanceLabel: "Thảo luận hiệu quả", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        guidance: ["Nêu bối cảnh và những gì bạn đã thử.", "Phản biện ý tưởng, không công kích con người.", "Dùng Hỏi đáp cho câu hỏi cần câu trả lời chính thức."], search: "Tìm trong thảo luận của khóa học", clearSearch: "Xóa nội dung tìm kiếm", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
        createError: "Chưa đăng được bài. Nội dung của bạn vẫn được giữ lại.", commentError: "Chưa đăng được phản hồi. Nội dung của bạn vẫn được giữ lại.", staleError: "Không tải được cập nhật mới nhất. Nội dung hiện có vẫn dùng được.", edited: "Đã chỉnh sửa", deletedBody: "Nội dung này đã được xóa.", // vn-ok: Vietnamese runtime copy while shared catalogs are outside the frozen Community page/block boundary.
    },
} as const

const randomKey = () => globalThis.crypto.randomUUID()
const client = () => createApolloClient({ withAuth: true })
const isForbiddenError = (error: unknown) => String(error).toUpperCase().includes("FORBIDDEN") || String(error).toUpperCase().includes("ACCESS_DENIED")
const required = <T,>(value: T | undefined): T => {
    if (value === undefined) throw new Error("Course Community returned no data")
    return value
}

/** Connected Course Community: course-qualified reads, writes, retries, and retained drafts. */
export const CourseCommunity = (props: CourseCommunityProps) => {
    const { displayId, postId } = props
    const locale = useLocale() === "vi" ? "vi" : "en"
    const copy = COPY[locale]
    const router = useRouter()
    const viewer = useViewerKey()
    const [mounted, setMounted] = useState(false)
    const [filter, setFilter] = useState<"all" | "mine">("all")
    const [query, setQuery] = useState("")
    const [draft, setDraft] = useState("")
    const [commentDraft, setCommentDraft] = useState("")
    const [replyDraft, setReplyDraft] = useState("")
    const [expandedParentId, setExpandedParentId] = useState<string>()
    const [editingPostBody, setEditingPostBody] = useState<string>()
    const [editingComment, setEditingComment] = useState<{ readonly id: string; readonly body: string }>()
    const [postCreateKey, setPostCreateKey] = useState(randomKey)
    const [commentCreateKey, setCommentCreateKey] = useState(randomKey)
    const [isCreating, setIsCreating] = useState(false)
    const [isCommenting, setIsCommenting] = useState(false)
    const [createError, setCreateError] = useState<string>()
    const [commentError, setCommentError] = useState<string>()
    const viewerScope = mounted ? viewer : undefined
    const courseName = decodeURIComponent(displayId).split("-").filter(Boolean).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ")

    useEffect(() => setMounted(true), [])

    const feed = useSWRInfinite<CommunityFeedPage>(
        (pageIndex, previous): FeedKey | null => {
            if (viewerScope === undefined || postId !== undefined || previous?.nextCursor === null) return null
            return ["COURSE_COMMUNITY_FEED", viewerScope, displayId, filter, query, pageIndex === 0 ? "" : previous?.nextCursor ?? ""]
        },
        async ([, , courseDisplayId, currentFilter, currentQuery, cursor]) => {
            const result = await client().query<{ readonly courseCommunityFeed: CommunityFeedPage }>({ query: FEED_QUERY, variables: { request: { courseDisplayId, mine: currentFilter === "mine", query: currentQuery === "" ? undefined : currentQuery, cursor: cursor === "" ? undefined : cursor, limit: 20 } } })
            return required(result.data).courseCommunityFeed
        },
    )
    const detail = useSWR<CommunityPostNode>(
        viewerScope === undefined || postId === undefined ? null : ["COURSE_COMMUNITY_DETAIL", viewerScope, displayId, postId] as DetailKey,
        async ([, , courseDisplayId, selectedPostId]: DetailKey) => required((await client().query<{ readonly courseCommunityPost: CommunityPostNode }>({ query: DETAIL_QUERY, variables: { request: { courseDisplayId, postId: selectedPostId } } })).data).courseCommunityPost,
    )
    const comments = useSWR<CommunityCommentsPage>(
        viewerScope === undefined || postId === undefined ? null : ["COURSE_COMMUNITY_COMMENTS", viewerScope, displayId, postId, ""] as CommentsKey,
        async ([, , courseDisplayId, selectedPostId]: CommentsKey) => required((await client().query<{ readonly courseCommunityPostComments: CommunityCommentsPage }>({ query: COMMENTS_QUERY, variables: { request: { courseDisplayId, postId: selectedPostId, limit: 50 } } })).data).courseCommunityPostComments,
    )
    const replies = useSWR<CommunityCommentsPage>(
        viewerScope === undefined || postId === undefined || expandedParentId === undefined ? null : ["COURSE_COMMUNITY_COMMENTS", viewerScope, displayId, postId, expandedParentId] as CommentsKey,
        async ([, , courseDisplayId, selectedPostId, parentCommentId]: CommentsKey) => required((await client().query<{ readonly courseCommunityPostComments: CommunityCommentsPage }>({ query: COMMENTS_QUERY, variables: { request: { courseDisplayId, postId: selectedPostId, parentCommentId, limit: 50 } } })).data).courseCommunityPostComments,
    )

    const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    const postRow = (node: CommunityPostNode): CourseCommunityPostRow => ({ id: node.id, body: node.isDeleted ? copy.deletedBody : node.body, authorName: node.author.username, authorAvatar: node.author.avatar ?? undefined, createdLabel: date(node.createdAt), editedLabel: node.editedAt === null ? undefined : copy.edited, commentCount: node.commentCount, reactions: node.reactions, isMine: node.isMine })
    const commentRow = (node: CommunityCommentNode): CourseCommunityCommentRow => ({ id: node.id, body: node.isDeleted ? copy.deletedBody : node.body, authorName: node.author.username, authorAvatar: node.author.avatar ?? undefined, createdLabel: date(node.createdAt), editedLabel: node.editedAt === null ? undefined : copy.edited, replyCount: node.replyCount, reactions: node.reactions, isMine: node.isMine && !node.isDeleted, parentCommentId: node.parentCommentId ?? undefined })
    const posts = useMemo(() => (feed.data ?? []).flatMap((page) => page.posts).map(postRow), [feed.data, locale])
    const commentRows = (comments.data?.comments ?? []).map(commentRow)
    const replyRows = (replies.data?.comments ?? []).map(commentRow)
    const mode = postId === undefined ? "feed" : "detail"
    const currentError = mode === "feed" ? feed.error : detail.error ?? comments.error
    const hasUsableData = mode === "feed" ? feed.data !== undefined : detail.data !== undefined
    const state = !mounted ? "pending" : viewer === undefined || isForbiddenError(currentError) ? "forbidden" : currentError !== undefined && !hasUsableData ? "failed" : !hasUsableData ? "pending" : mode === "feed" && posts.length === 0 ? "empty" : "ready"
    const refreshAll = () => Promise.all([feed.mutate(), detail.mutate(), comments.mutate(), replies.mutate()])
    const mutatePost = async (document: typeof UPDATE_POST, request: Record<string, unknown>) => {
        await client().mutate({ mutation: document, variables: { request } })
        await refreshAll()
    }
    const mutateComment = async (document: typeof UPDATE_COMMENT, request: Record<string, unknown>) => {
        await client().mutate({ mutation: document, variables: { request } })
        await refreshAll()
    }

    return <CourseCommunityBase
        mode={mode}
        state={state}
        copy={{ title: copy.title, subtitle: copy.subtitle, courseName, trail: [{ id: "course", label: courseName }, { id: "community", label: copy.title }], searchPlaceholder: copy.search, searchLabel: copy.search, clearSearchLabel: copy.clearSearch, allLabel: copy.all, mineLabel: copy.mine, composerLabel: copy.composer, composerPlaceholder: copy.composerPlaceholder, composerHint: copy.composerHint, publishLabel: copy.publish, postsLabel: copy.posts, commentsLabel: copy.comments, commentPlaceholder: copy.commentPlaceholder, commentLabel: copy.comment, replyLabel: copy.reply, replyPlaceholder: copy.replyPlaceholder, likeLabel: copy.like, unlikeLabel: copy.unlike, commentsCount: (count) => `${count} ${copy.comments.toLocaleLowerCase(locale)}`, repliesCount: (count) => `${count} ${copy.reply.toLocaleLowerCase(locale)}`, reactionCount: (count) => String(count), emptyLabel: copy.empty, filteredEmptyLabel: copy.filteredEmpty, failedTitle: copy.failedTitle, failedLabel: copy.failed, forbiddenTitle: copy.forbiddenTitle, forbiddenLabel: copy.forbidden, unavailableLabel: copy.unavailable, retryLabel: copy.retry, openCourseLabel: copy.openCourse, clearCriteriaLabel: copy.clear, loadMoreLabel: copy.loadMore, backLabel: copy.back, editLabel: copy.edit, saveLabel: copy.save, cancelLabel: copy.cancel, deleteLabel: copy.delete, confirmDeleteLabel: copy.confirmDelete, mineBadge: copy.mineBadge, activityLabel: copy.activity, postsFactLabel: copy.postsFact, commentsFactLabel: copy.commentsFact, guidanceLabel: copy.guidanceLabel, guidance: copy.guidance }}
        filter={filter}
        query={query}
        posts={posts}
        post={detail.data === undefined ? undefined : postRow(detail.data)}
        comments={commentRows}
        replies={replyRows}
        expandedParentId={expandedParentId}
        draft={draft}
        commentDraft={commentDraft}
        replyDraft={replyDraft}
        editingPostBody={editingPostBody}
        editingCommentId={editingComment?.id}
        editingCommentBody={editingComment?.body}
        createError={createError}
        commentError={commentError}
        staleError={currentError !== undefined && hasUsableData ? copy.staleError : undefined}
        isCreating={isCreating}
        isCommenting={isCommenting}
        isLoadingMore={feed.isValidating && feed.data !== undefined}
        hasMore={feed.data?.at(-1)?.nextCursor !== null}
        authoredPostCount={posts.length}
        authoredCommentCount={commentRows.length + replyRows.length}
        on={{
            openCourse: () => router.push(`/courses/${displayId}/learn`),
            search: setQuery,
            filter: setFilter,
            changeDraft: setDraft,
            publish: () => {
                const body = draft.trim()
                if (body === "" || isCreating) return
                setIsCreating(true); setCreateError(undefined)
                void client().mutate({ mutation: CREATE_POST, variables: { request: { courseDisplayId: displayId, body, idempotencyKey: postCreateKey } } }).then(async () => { setDraft(""); setPostCreateKey(randomKey()); await feed.mutate() }).catch(() => setCreateError(copy.createError)).finally(() => setIsCreating(false))
            },
            openPost: (id) => router.push(`/courses/${displayId}/learn/community/posts/${id}`),
            retry: () => { void refreshAll() },
            clearCriteria: () => { setFilter("all"); setQuery("") },
            loadMore: () => { void feed.setSize((size) => size + 1) },
            back: () => router.push(`/courses/${displayId}/learn/community`),
            reactPost: (id, active) => { void mutatePost(REACT_POST, { courseDisplayId: displayId, postId: id, type: active ? null : "like" }) },
            changeCommentDraft: setCommentDraft,
            comment: () => {
                if (postId === undefined || commentDraft.trim() === "" || isCommenting) return
                setIsCommenting(true); setCommentError(undefined)
                void client().mutate({ mutation: CREATE_COMMENT, variables: { request: { courseDisplayId: displayId, postId, body: commentDraft.trim(), idempotencyKey: commentCreateKey } } }).then(async () => { setCommentDraft(""); setCommentCreateKey(randomKey()); await refreshAll() }).catch(() => setCommentError(copy.commentError)).finally(() => setIsCommenting(false))
            },
            expandReplies: (id) => { setExpandedParentId((current) => current === id ? undefined : id); setReplyDraft("") },
            changeReplyDraft: setReplyDraft,
            reply: (parentCommentId) => {
                if (postId === undefined || replyDraft.trim() === "" || isCommenting) return
                setIsCommenting(true); setCommentError(undefined)
                void client().mutate({ mutation: CREATE_COMMENT, variables: { request: { courseDisplayId: displayId, postId, parentCommentId, body: replyDraft.trim(), idempotencyKey: commentCreateKey } } }).then(async () => { setReplyDraft(""); setCommentCreateKey(randomKey()); await refreshAll() }).catch(() => setCommentError(copy.commentError)).finally(() => setIsCommenting(false))
            },
            reactComment: (id, active) => { void mutateComment(REACT_COMMENT, { courseDisplayId: displayId, commentId: id, type: active ? null : "like" }) },
            beginEditPost: () => setEditingPostBody(detail.data?.body ?? ""),
            changeEditPost: setEditingPostBody,
            savePost: () => { if (postId !== undefined && editingPostBody?.trim()) void mutatePost(UPDATE_POST, { courseDisplayId: displayId, postId, body: editingPostBody.trim() }).then(() => setEditingPostBody(undefined)) },
            cancelEditPost: () => setEditingPostBody(undefined),
            deletePost: () => { if (postId !== undefined) void mutatePost(DELETE_POST, { courseDisplayId: displayId, postId }).then(() => router.push(`/courses/${displayId}/learn/community`)) },
            beginEditComment: (id, body) => setEditingComment({ id, body }),
            changeEditComment: (body) => setEditingComment((current) => current === undefined ? undefined : { ...current, body }),
            saveComment: (id) => { if (editingComment?.body.trim()) void mutateComment(UPDATE_COMMENT, { courseDisplayId: displayId, commentId: id, body: editingComment.body.trim() }).then(() => setEditingComment(undefined)) },
            cancelEditComment: () => setEditingComment(undefined),
            deleteComment: (id) => { void mutateComment(DELETE_COMMENT, { courseDisplayId: displayId, commentId: id }) },
        }}
    />
}
