import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseCommunityBase, type CourseCommunityProps } from "./component"

const copy: CourseCommunityProps["copy"] = {
    title: "Course Community", subtitle: "Learn with this course community.", courseName: "TypeScript", trail: [{ id: "course", label: "TypeScript" }, { id: "community", label: "Community" }],
    searchPlaceholder: "Search discussions", searchLabel: "Search discussions", clearSearchLabel: "Clear search", allLabel: "All posts", mineLabel: "My posts",
    composerLabel: "Start a discussion", composerPlaceholder: "Share what you tried", composerHint: "Use Q&A for authoritative answers.", publishLabel: "Publish", postsLabel: "Discussions",
    commentsLabel: "Comments", commentPlaceholder: "Add a response", commentLabel: "Comment", replyLabel: "Reply", replyPlaceholder: "Write a reply", likeLabel: "Like", unlikeLabel: "Unlike",
    commentsCount: (count) => `${count} comments`, repliesCount: (count) => `${count} replies`, reactionCount: (count) => `${count} reactions`, emptyLabel: "No discussions yet.",
    filteredEmptyLabel: "No discussions match.", failedTitle: "Community unavailable", failedLabel: "Could not load Community.", forbiddenTitle: "Community access required", forbiddenLabel: "Course access is required.", unavailableLabel: "Discussion unavailable.",
    retryLabel: "Try again", openCourseLabel: "Back to course", clearCriteriaLabel: "Clear filters", loadMoreLabel: "Load more", backLabel: "Back to Community", editLabel: "Edit", saveLabel: "Save", cancelLabel: "Cancel",
    deleteLabel: "Delete", confirmDeleteLabel: "Press again to delete", mineBadge: "Yours", activityLabel: "Current view", postsFactLabel: "Posts loaded", commentsFactLabel: "Comments loaded",
    guidanceLabel: "Good discussion", guidance: ["Share context.", "Challenge ideas."],
}

const post = { id: "post-1", body: "I compared two approaches.", authorName: "uat-learner", createdLabel: "31 Aug 2026", commentCount: 1, reactions: { total: 2, myReaction: null }, isMine: true }
const comment = { id: "comment-1", body: "The second approach scales better.", authorName: "peer", createdLabel: "31 Aug 2026", replyCount: 1, reactions: { total: 1, myReaction: null }, isMine: false }
const base: CourseCommunityProps = { mode: "feed", state: "ready", copy, filter: "all", query: "", posts: [post], comments: [], replies: [], draft: "", commentDraft: "", replyDraft: "", on: {} }

describe("CourseCommunityBase", () => {
    it("renders the course-contained feed and disables a blank publish", () => {
        render(<CourseCommunityBase {...base} />)
        expect(screen.getByText(post.body)).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Publish" })).toBeDisabled()
        expect(screen.getByText("Use Q&A for authoritative answers.")).toBeInTheDocument()
    })

    it("retains authored text beside a recoverable create failure", () => {
        render(<CourseCommunityBase {...base} draft="A retained draft" createError="Still here after failure" />)
        expect(screen.getByRole("textbox", { name: "Start a discussion" })).toHaveValue("A retained draft")
        expect(screen.getByRole("alert")).toHaveTextContent("Still here after failure")
        expect(screen.getByRole("button", { name: "Publish" })).toBeEnabled()
    })

    it("distinguishes filtered empty and clears criteria", () => {
        const clearCriteria = vi.fn()
        render(<CourseCommunityBase {...base} state="empty" query="cursor" posts={[]} on={{ clearCriteria }} />)
        expect(screen.getByText("No discussions match.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Clear filters" }))
        expect(clearCriteria).toHaveBeenCalledOnce()
    })

    it("retries a settled first-load failure", () => {
        const retry = vi.fn()
        render(<CourseCommunityBase {...base} state="failed" posts={[]} on={{ retry }} />)
        expect(screen.getByText("Could not load Community.")).toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Try again" }))
        expect(retry).toHaveBeenCalledOnce()
    })

    it("lets the access-required state own the feed and return to the course", () => {
        const openCourse = vi.fn()
        render(<CourseCommunityBase {...base} state="forbidden" posts={[]} on={{ openCourse }} />)
        expect(screen.getByText("Course access is required.")).toBeInTheDocument()
        expect(screen.queryByRole("textbox", { name: "Start a discussion" })).not.toBeInTheDocument()
        expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
        expect(screen.queryByText("Current view")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: "Back to course" }))
        expect(openCourse).toHaveBeenCalledOnce()
    })

    it("keeps usable posts during a stale refresh failure", () => {
        render(<CourseCommunityBase {...base} staleError="Latest refresh failed" />)
        expect(screen.getByText(post.body)).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("Latest refresh failed")
    })

    it("renders detail, comment thread and an expanded reply composer", () => {
        const reply = vi.fn()
        render(<CourseCommunityBase {...base} mode="detail" post={post} posts={[]} comments={[comment]} expandedParentId={comment.id} replyDraft="A nested answer" on={{ reply }} />)
        expect(screen.getByText(comment.body)).toBeInTheDocument()
        expect(screen.getByRole("textbox", { name: "Reply" })).toHaveValue("A nested answer")
        fireEvent.click(screen.getByRole("button", { name: "Reply" }))
        expect(reply).toHaveBeenCalledWith(comment.id)
    })

    it("offers a safe return when a direct discussion is unavailable", () => {
        const back = vi.fn()
        render(<CourseCommunityBase {...base} mode="detail" state="forbidden" post={undefined} posts={[]} on={{ back }} />)
        expect(screen.getByText("Discussion unavailable.")).toBeInTheDocument()
        fireEvent.click(screen.getAllByRole("button", { name: "Back to Community" }).at(-1) as HTMLButtonElement)
        expect(back).toHaveBeenCalled()
    })
})
