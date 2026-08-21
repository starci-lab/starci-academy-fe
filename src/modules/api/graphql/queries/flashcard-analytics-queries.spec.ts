import { beforeEach, describe, expect, it, vi } from "vitest"
import { print } from "graphql"
import { queryMyFlashcardReviewHistory } from "./query-my-flashcard-review-history"
import { queryMyFlashcardReviewStats } from "./query-my-flashcard-review-stats"
import { queryMyFlashcardQuizHistory } from "./query-my-flashcard-quiz-history"
import { queryMyFlashcardQuizStats } from "./query-my-flashcard-quiz-stats"

const mocks = vi.hoisted(() => ({ query: vi.fn(), createApolloClient: vi.fn() }))
vi.mock("../clients/create-apollo-client", () => ({ createApolloClient: mocks.createApolloClient }))

beforeEach(() => {
    mocks.query.mockReset().mockResolvedValue({ data: undefined })
    mocks.createApolloClient.mockReset().mockReturnValue({ query: mocks.query })
})

describe("flashcard analytics queries", () => {
    it("reads paginated review history", async () => {
        await queryMyFlashcardReviewHistory("course", 10, 20)
        const call = mocks.query.mock.calls[0][0]
        expect(call.variables).toEqual({ courseId: "course", limit: 10, offset: 20 })
        expect(print(call.query)).toContain("reviewedCount")
    })

    it("reads review health evidence", async () => {
        await queryMyFlashcardReviewStats("course")
        expect(print(mocks.query.mock.calls[0][0].query)).toContain("leechFocus")
    })

    it("reads paginated cloze history", async () => {
        await queryMyFlashcardQuizHistory("course", 15, 5)
        const call = mocks.query.mock.calls[0][0]
        expect(call.variables).toEqual({ courseId: "course", limit: 15, offset: 5 })
        expect(print(call.query)).toContain("weakTags")
    })

    it("reads aggregate concept coverage", async () => {
        await queryMyFlashcardQuizStats("course")
        expect(print(mocks.query.mock.calls[0][0].query)).toContain("conceptCoverage")
    })
})
