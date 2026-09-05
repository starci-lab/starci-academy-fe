import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
    data: undefined as unknown,
    error: undefined as unknown,
    mutate: vi.fn(),
}))
type ReaderStubProps = { readonly state: string; readonly selectedSectionId: string }

vi.mock("next-intl", () => ({
    useLocale: () => "en",
    useTranslations: () => (key: string, values?: Record<string, unknown>) => `${key}${values === undefined ? "" : JSON.stringify(values)}`,
}))
vi.mock("@/hooks/swr/useQueryConceptSwr", () => ({
    useQueryConceptSwr: () => ({ data: mocks.data, error: mocks.error, mutate: mocks.mutate }),
}))
vi.mock("./component", () => ({
    ConceptDetailPageBase: ({ state, selectedSectionId }: ReaderStubProps) => (
        <output data-testid="reader" data-state={state} data-section={selectedSectionId} />
    ),
}))

import { ConceptDetailPage } from "./index"

beforeEach(() => {
    mocks.data = undefined
    mocks.error = undefined
})

describe("ConceptDetailPage", () => {
    it("opens the first authored section after the API document arrives", async () => {
        mocks.data = {
            sections: [
                { displayId: "explain", sortIndex: 20 },
                { displayId: "interview-context", sortIndex: 10 },
            ],
        }
        render(<ConceptDetailPage displayId="request-response-lifecycle" />)
        await waitFor(() => expect(screen.getByTestId("reader")).toHaveAttribute("data-section", "interview-context"))
        expect(screen.getByTestId("reader")).toHaveAttribute("data-state", "ready")
    })

    it("distinguishes a successful missing record from a failed request", () => {
        mocks.data = null
        render(<ConceptDetailPage displayId="unknown" />)
        expect(screen.getByTestId("reader")).toHaveAttribute("data-state", "missing")
    })
})
