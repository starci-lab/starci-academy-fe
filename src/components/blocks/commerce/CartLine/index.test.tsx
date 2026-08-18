import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useMutateRemoveFromCartSwr } from "@/hooks"
import { QUERY_MY_CART_SWR_KEY } from "@/hooks/swr/useQueryMyCartSwr"
import { CartLine } from "./index"

const mutate = vi.fn()

vi.mock("swr", async (importOriginal) => ({
    ...await importOriginal<typeof import("swr")>(),
    useSWRConfig: () => ({ mutate }),
}))

vi.mock("@/hooks", () => ({ useMutateRemoveFromCartSwr: vi.fn() }))

const line = {
    courseId: "course-1",
    title: "Fullstack Mastery",
    tier: "Advanced",
    cover: null,
    price: "1,250,000 ₫",
    removeLabel: "Remove Fullstack Mastery from cart",
}

const stub = (answer?: unknown, over: Record<string, unknown> = {}) => {
    const trigger = vi.fn(async () => answer)
    vi.mocked(useMutateRemoveFromCartSwr).mockReturnValue({
        trigger,
        isMutating: false,
        ...over,
    } as never)
    return trigger
}

const press = () =>
    fireEvent.click(screen.getByRole("button", { name: "Remove Fullstack Mastery from cart" }))

afterEach(() => {
    cleanup()
    vi.clearAllMocks()
})

describe("CartLine", () => {
    it("asks for this course alone and revalidates the cart once the server confirms", async () => {
        const trigger = stub({ data: { removeFromCart: { success: true } } })

        render(<CartLine line={line} />)
        expect(useMutateRemoveFromCartSwr).toHaveBeenCalledWith("course-1")
        press()

        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())
        expect(trigger).toHaveBeenCalledExactlyOnceWith({ courseId: "course-1" })
    })

    it("revalidates every cart entry and leaves unrelated caches alone", async () => {
        stub({ data: { removeFromCart: { success: true } } })

        render(<CartLine line={line} />)
        press()
        await waitFor(() => expect(mutate).toHaveBeenCalledOnce())

        const matches = vi.mocked(mutate).mock.calls[0]?.[0] as (key: unknown) => boolean
        expect(matches([...QUERY_MY_CART_SWR_KEY, "viewer-7"])).toBe(true)
        expect(matches(["QUERY_MY_KPIS_SWR", "viewer-7"])).toBe(false)
        expect(matches(QUERY_MY_CART_SWR_KEY[0])).toBe(false)
    })

    it.each([
        ["a refusal", { data: { removeFromCart: { success: false } } }],
        ["an empty removal payload", { data: { removeFromCart: null } }],
        ["an empty envelope", { data: null }],
        ["no answer at all", undefined],
    ])("leaves the line on screen and the cart untouched on %s", async (_case, answer) => {
        const trigger = stub(answer)

        render(<CartLine line={line} />)
        press()

        await waitFor(() => expect(trigger).toHaveBeenCalledOnce())
        expect(mutate).not.toHaveBeenCalled()
        expect(screen.getByText("Fullstack Mastery")).toBeInTheDocument()
    })

    it("refuses a second removal while this line's own request is still running", () => {
        const trigger = stub({ data: { removeFromCart: { success: true } } }, { isMutating: true })

        render(<CartLine line={line} />)
        press()

        expect(trigger).not.toHaveBeenCalled()
        expect(mutate).not.toHaveBeenCalled()
    })

    it("keeps a resting shape idle rather than holding a removal for a course it has no id for", () => {
        stub({ data: { removeFromCart: { success: true } } })

        render(<CartLine state="pending" line={line} />)

        expect(useMutateRemoveFromCartSwr).toHaveBeenCalledWith(undefined)
        expect(document.querySelector("[data-component=\"CoverImage\"]")).toHaveAttribute(
            "data-loading",
            "true",
        )
        expect(screen.queryByText("Fullstack Mastery")).toBeNull()
    })
})
