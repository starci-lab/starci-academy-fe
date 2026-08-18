/** @vitest-environment jsdom */
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMutateCreateCourseQuestionSwr } from "./useMutateCreateCourseQuestionSwr"

/**
 * What these tests guard: the question is wrapped as `request` and asked against ONE course, and it
 * is asked on a press rather than on a render - a board that posted while merely opening would file
 * a blank question every time somebody looked at it.
 */

const mocks = vi.hoisted(() => ({ mutationCreateCourseQuestion: vi.fn() }))

vi.mock("@/modules/api/graphql/mutations/mutation-create-course-question", () => ({
    mutationCreateCourseQuestion: mocks.mutationCreateCourseQuestion,
}))

/** What the transport answers for an accepted question. */
const created = {
    data: {
        createComment: {
            success: true, message: "ok", data: { id: "question-1", body: "Why two indexes?" },
        },
    },
}

beforeEach(() => {
    mocks.mutationCreateCourseQuestion.mockReset()
    mocks.mutationCreateCourseQuestion.mockResolvedValue(created)
})

describe("useMutateCreateCourseQuestionSwr", () => {
    it("asks nothing until the reader presses", () => {
        const { result } = renderHook(() => useMutateCreateCourseQuestionSwr())
        expect(mocks.mutationCreateCourseQuestion).not.toHaveBeenCalled()
        expect(result.current.isMutating).toBe(false)
        expect(result.current.data).toBeUndefined()
    })

    it("wraps the trigger argument as the request and hands back the created question", async () => {
        const { result } = renderHook(() => useMutateCreateCourseQuestionSwr())

        const request = { courseId: "course-1", body: "Why two indexes?" }
        await act(async () => {
            await expect(result.current.trigger(request)).resolves.toEqual(created)
        })
        expect(mocks.mutationCreateCourseQuestion).toHaveBeenCalledWith({ request })
    })

    it("hands back a refusal as data, so the board can say why", async () => {
        const refused = { data: { createComment: { success: false, message: "Not enrolled" } } }
        mocks.mutationCreateCourseQuestion.mockResolvedValue(refused)
        const { result } = renderHook(() => useMutateCreateCourseQuestionSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1", body: "Why?" }))
                .resolves.toEqual(refused)
        })
        expect(result.current.error).toBeUndefined()
    })

    it("reports a transport failure as an error rather than as a posted question", async () => {
        mocks.mutationCreateCourseQuestion.mockRejectedValue(new Error("offline"))
        const { result } = renderHook(() => useMutateCreateCourseQuestionSwr())

        await act(async () => {
            await expect(result.current.trigger({ courseId: "course-1", body: "Why?" }))
                .rejects.toThrow("offline")
        })
        expect(result.current.error).toBeInstanceOf(Error)
    })
})
