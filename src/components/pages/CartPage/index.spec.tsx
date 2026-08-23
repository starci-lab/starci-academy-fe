import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/blocks/commerce/CartBlock", () => ({
    CartBlock: () => <output data-testid="cart-block">cart-block</output>,
}))

import { CartPage } from "./index"

describe("CartPage route", () => {
    it("composes the connected cart block without owning its state", () => {
        render(<CartPage />)
        expect(screen.getByTestId("cart-block")).toHaveTextContent("cart-block")
    })
})
