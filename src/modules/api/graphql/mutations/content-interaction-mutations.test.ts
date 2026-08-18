import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { mutationCreateCourseQuestion, MutationCreateCourseQuestion } from "./mutation-create-course-question"
import { mutationReactActivity, mutationReactActivityMap, MutationReactActivity } from "./mutation-react-activity"
import { mutationReactContent, mutationReactContentMap, MutationReactContent } from "./mutation-react-content"
import { mutationSetFollow, mutationSetFollowMap, MutationSetFollow } from "./mutation-set-follow"
import {
    mutationSubmitContentChallenge,
    mutationSubmitContentChallengeMap,
    MutationSubmitContentChallenge,
} from "./mutation-submit-content-challenge"
import {
    mutationSubmitContentComment,
    mutationSubmitContentCommentMap,
    MutationSubmitContentComment,
} from "./mutation-submit-content-comment"
import { ReactionType } from "../queries/types/reactions"

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), createApolloClient: vi.fn() }))

vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.mutate.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ mutate: mocks.mutate })
})

const sentDocument = (index = 0) => print(mocks.mutate.mock.calls[index][0].mutation)

describe("mutationCreateCourseQuestion", () => {
    it("selects the authored thread fields the Q&A list renders", async () => {
        await mutationCreateCourseQuestion({ request: { courseId: "course-1", body: "How does this work?" } })
        const document = sentDocument()
        expect(document).toContain("createComment(request: $request)")
        expect(document).toContain("isFounderAuthor")
        expect(document).toContain("replyCount")
        expect(document).toContain("parentCommentId")
        expect(document).toContain("author {")
    })

    it("never sends a lesson scope, and defaults the variant when none is named", async () => {
        await mutationCreateCourseQuestion({ request: { courseId: "course-1", body: "Why?" } })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { courseId: "course-1", body: "Why?" } })
        expect(mocks.mutate.mock.calls[0][0].variables.request).not.toHaveProperty("contentId")
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: undefined,
            signal: undefined,
            debug: undefined,
        })
    })

    it("sends the same document when the caller names the variant, and forwards transport options", async () => {
        const signal = new AbortController().signal
        await mutationCreateCourseQuestion({
            mutation: MutationCreateCourseQuestion.Mutation1,
            request: { courseId: "course-1", body: "Why?" },
            headers: { "x-trace": "qa" },
            signal,
            debug: true,
        })
        await mutationCreateCourseQuestion({ request: { courseId: "course-1", body: "Why?" } })
        expect(sentDocument(0)).toEqual(sentDocument(1))
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: { "x-trace": "qa" },
            signal,
            debug: true,
        })
    })

    it("propagates a rejected question submission", async () => {
        mocks.mutate.mockRejectedValue(new Error("rate limited"))
        await expect(
            mutationCreateCourseQuestion({ request: { courseId: "course-1", body: "Why?" } }),
        ).rejects.toThrow("rate limited")
    })
})

describe("mutationReactActivity", () => {
    it("selects the refreshed counter and the viewer's own reaction", () => {
        const document = print(mutationReactActivityMap[MutationReactActivity.Mutation1])
        expect(document).toContain("reactToActivity(request: $request)")
        expect(document).toContain("total")
        expect(document).toContain("myReaction")
    })

    it("sets a reaction through the default variant on an authenticated client", async () => {
        await mutationReactActivity({ request: { activityId: "activity-1", type: ReactionType.Love } })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationReactActivityMap[MutationReactActivity.Mutation1],
            variables: { request: { activityId: "activity-1", type: ReactionType.Love } },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("removes a reaction with an explicit null and an explicitly named variant", async () => {
        await mutationReactActivity({
            mutation: MutationReactActivity.Mutation1,
            request: { activityId: "activity-1", type: null },
            headers: { "x-trace": "feed" },
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { activityId: "activity-1", type: null },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ headers: { "x-trace": "feed" } })
    })
})

describe("mutationReactContent", () => {
    it("selects the full lesson reaction summary, not just the total", () => {
        const document = print(mutationReactContentMap[MutationReactContent.Mutation1])
        expect(document).toContain("reactToContent(request: $request)")
        expect(document).toContain("viewCount")
        expect(document).toContain("shareCount")
        expect(document).toContain("counts {")
    })

    it("sends the viewer's chosen reaction with the default variant", async () => {
        await mutationReactContent({ request: { contentId: "content-1", type: ReactionType.Wow } })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationReactContentMap[MutationReactContent.Mutation1],
            variables: { request: { contentId: "content-1", type: ReactionType.Wow } },
        })
    })

    it("clears the reaction and forwards an abort signal on the named variant", async () => {
        const signal = new AbortController().signal
        await mutationReactContent({
            mutation: MutationReactContent.Mutation1,
            request: { contentId: "content-1", type: null },
            signal,
            debug: true,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { contentId: "content-1", type: null } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: undefined,
            signal,
            debug: true,
        })
    })
})

describe("mutationSetFollow", () => {
    it("asks only for the envelope, because follow state carries no payload", () => {
        const document = print(mutationSetFollowMap[MutationSetFollow.Mutation1])
        expect(document).toContain("setFollow(request: $request)")
        expect(document).toContain("success")
        expect(document).not.toContain("data {")
    })

    it("follows through the default variant", async () => {
        await mutationSetFollow({ request: { userId: "user-1", follow: true } })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationSetFollowMap[MutationSetFollow.Mutation1],
            variables: { request: { userId: "user-1", follow: true } },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("unfollows through the explicitly named variant", async () => {
        await mutationSetFollow({
            mutation: MutationSetFollow.Mutation1,
            request: { userId: "user-1", follow: false },
            headers: { "x-trace": "follow" },
            debug: false,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({ request: { userId: "user-1", follow: false } })
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: { "x-trace": "follow" },
            signal: undefined,
            debug: false,
        })
    })
})

describe("mutationSubmitContentChallenge", () => {
    it("selects the async job identity rather than a verdict", () => {
        const document = print(mutationSubmitContentChallengeMap[MutationSubmitContentChallenge.Mutation1])
        expect(document).toContain("submitChallengeSubmission(request: $request)")
        expect(document).toContain("jobId")
    })

    it("sends the minimal submission through the default variant", async () => {
        await mutationSubmitContentChallenge({ request: { challengeSubmissionId: "sub-1" } })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationSubmitContentChallengeMap[MutationSubmitContentChallenge.Mutation1],
            variables: { request: { challengeSubmissionId: "sub-1" } },
        })
    })

    it("carries the repository URL and model selection when the learner picked one", async () => {
        await mutationSubmitContentChallenge({
            mutation: MutationSubmitContentChallenge.Mutation1,
            request: {
                challengeSubmissionId: "sub-1",
                githubUrl: "https://github.com/a/b",
                selectedModel: "qwen3",
                selectedModelProvider: "local",
                lang: "vi",
            },
            signal: new AbortController().signal,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: {
                challengeSubmissionId: "sub-1",
                githubUrl: "https://github.com/a/b",
                selectedModel: "qwen3",
                selectedModelProvider: "local",
                lang: "vi",
            },
        })
    })

    it("propagates a rejected grading enqueue", async () => {
        mocks.mutate.mockRejectedValue(new Error("queue full"))
        await expect(
            mutationSubmitContentChallenge({ request: { challengeSubmissionId: "sub-1" } }),
        ).rejects.toThrow("queue full")
    })
})

describe("mutationSubmitContentComment", () => {
    it("selects the reaction summary the new comment renders with", () => {
        const document = print(mutationSubmitContentCommentMap[MutationSubmitContentComment.Mutation1])
        expect(document).toContain("createComment(request: $request)")
        expect(document).toContain("reactions {")
        expect(document).toContain("counts {")
        expect(document).toContain("isFounderAuthor")
    })

    it("creates a top-level comment through the default variant", async () => {
        await mutationSubmitContentComment({ request: { contentId: "content-1", body: "Nice" } })
        expect(mocks.mutate).toHaveBeenCalledWith({
            mutation: mutationSubmitContentCommentMap[MutationSubmitContentComment.Mutation1],
            variables: { request: { contentId: "content-1", body: "Nice" } },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toMatchObject({ withAuth: true })
    })

    it("creates a reply by carrying the parent id on the named variant", async () => {
        await mutationSubmitContentComment({
            mutation: MutationSubmitContentComment.Mutation1,
            request: { contentId: "content-1", parentCommentId: "comment-9", body: "Agreed" },
            headers: { "x-trace": "reply" },
            debug: true,
        })
        expect(mocks.mutate.mock.calls[0][0].variables).toEqual({
            request: { contentId: "content-1", parentCommentId: "comment-9", body: "Agreed" },
        })
        expect(mocks.createApolloClient.mock.calls[0][0]).toEqual({
            withAuth: true,
            headers: { "x-trace": "reply" },
            signal: undefined,
            debug: true,
        })
    })
})
