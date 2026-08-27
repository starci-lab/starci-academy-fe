/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { TrendingContentRow } from "./index"

/**
 * What these tests guard - that the accent means "top three" and nothing else.
 *
 * The row's whole job is to say where a result stands, and the only thing separating rank four from
 * rank three is the tone of two characters. A row that accents everything says nothing, so the tone
 * is asserted on both sides of the cut rather than assumed from the flag being passed.
 */

afterEach(cleanup)

describe("TrendingContentRow", () => {
    it("accents the rank of a top-three result", () => {
        render(<TrendingContentRow props={{ id: "c1", rank: "2", title: "Ownership", isTopRank: true }} />)
        expect(screen.getByText("2")).toHaveAttribute("data-tone", "accent")
        expect(screen.getByText("Ownership")).toBeInTheDocument()
    })

    it("quiets the rank of everything below the cut", () => {
        render(<TrendingContentRow props={{ id: "c1", rank: "4", title: "Borrowing", isTopRank: false }} />)
        expect(screen.getByText("4")).toHaveAttribute("data-tone", "muted")
    })

    it("treats an unstated standing as below the cut rather than above it", () => {
        render(<TrendingContentRow props={{ id: "c1", rank: "9", title: "Lifetimes" }} />)
        expect(screen.getByText("9")).toHaveAttribute("data-tone", "muted")
    })

    it("reports the reader opening the result", () => {
        const open = vi.fn()
        render(<TrendingContentRow props={{ id: "c1", rank: "1", title: "Ownership", isTopRank: true }} on={{ open }} />)
        fireEvent.click(screen.getByText("Ownership"))
        expect(open).toHaveBeenCalledOnce()
    })

    it("rests without a title, and offers an empty word rather than the text undefined", () => {
        const { container } = render(<TrendingContentRow props={{ id: "resting-0" }} isLoading />)
        expect(container.querySelector("[data-loading=\"true\"]")).toBeInTheDocument()
        expect(screen.queryByText("undefined")).toBeNull()
        expect(container.firstElementChild?.children).toHaveLength(2)
        expect(container.firstElementChild?.lastElementChild).toHaveTextContent("")
    })
})
