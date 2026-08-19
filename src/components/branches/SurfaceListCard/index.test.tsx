import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { SurfaceListCard, type SurfaceListCardData } from "."
import { Tree } from "@/components/branches/Tree"
import {
    defineContractComponent,
    defineLeafComponent,
    type LeafProps,
} from "@/components/contracts/props"

/**
 * What these tests guard.
 *
 * The list contract owns the rows; this branch owns only the label above the joined surface and the
 * whole-list outcome below it. So what is asserted here is the frame: which label shape it draws,
 * what the surface announces about its own context, and the rule that the closing line holds an
 * action OR a description - never both, and never an action that leads nowhere.
 *
 * The rows themselves arrive as a typed render component the branch calls with the same data and
 * outcomes it was given, which is how a caller projects validated content into the vendor body.
 */

type RowData = SurfaceListCardData & { readonly rows: ReadonlyArray<string> }
type RowActions = { readonly [key: string]: (() => void) | undefined }

const RowsView = ({ props, on, isLoading = false }: LeafProps<RowData, RowActions>) => (
    <Tree
        contract="next-action-list"
        render={defineContractComponent("next-action-list", {
            step: props.rows.map((row) => defineContractComponent("next-action-row", {
                label: defineLeafComponent("text", { size: "md" }, () => (
                    <button type="button" data-loading={String(isLoading)} onClick={on?.[`open:${row}`]}>{row}</button>
                )),
            })),
        })}
    />
)

const Rows = defineContractComponent("next-action-list", RowsView)

const base: RowData = { label: "Course standings", rows: ["Ada", "Grace"] }

describe("SurfaceListCard", () => {
    it("names the list with a heading and hands the rows their own data and outcomes", () => {
        const open = vi.fn()
        const { container } = render(
            <SurfaceListCard contract="next-action-list" render={Rows} props={base} on={{ "open:Ada": open }} />,
        )

        expect(screen.getByRole("heading", { name: "Course standings" })).toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"next-action-row\"]")).toHaveLength(2)
        expect(container.querySelector("[data-node=\"label-with-muted-fact-row\"]")).toBeNull()
        fireEvent.click(screen.getByRole("button", { name: "Ada" }))
        expect(open).toHaveBeenCalledOnce()
    })

    it("swaps the heading for a label-and-fact row once the list carries a status", () => {
        const { container } = render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, fact: "Updated 2 minutes ago" }}
            />,
        )

        expect(container.querySelector("[data-node=\"label-with-muted-fact-row\"]")).not.toBeNull()
        expect(screen.queryByRole("heading", { name: "Course standings" })).not.toBeInTheDocument()
        expect(screen.getByText("Updated 2 minutes ago")).toBeInTheDocument()
        expect(screen.getByText("Course standings")).toBeInTheDocument()
    })

    it("keeps the name as data without drawing it twice under a surface that already said it", () => {
        const { container } = render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, isLabelHidden: true, fact: "2 rows" }}
            />,
        )

        expect(screen.queryByText("Course standings")).not.toBeInTheDocument()
        expect(screen.queryByText("2 rows")).not.toBeInTheDocument()
        expect(container.querySelectorAll("[data-node=\"next-action-row\"]")).toHaveLength(2)
    })

    it("states its own surface context and verdict treatment on the card it draws", () => {
        const { container } = render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, isNested: true, isVerdict: true }}
            />,
        )

        const surface = container.querySelector("[data-component=\"SurfaceListCardSurface\"]")
        expect(surface).toHaveAttribute("data-surface-context", "nested")
        expect(surface).toHaveAttribute("data-verdict", "true")
        expect(container.querySelector("[data-component=\"SurfaceListCardBody\"]")?.className).toContain("rounded-none")
    })

    it("defaults to a page-level, non-verdict surface with its own inset zeroed", () => {
        const { container } = render(<SurfaceListCard contract="next-action-list" render={Rows} props={base} />)

        const surface = container.querySelector("[data-component=\"SurfaceListCardSurface\"]")
        expect(surface).toHaveAttribute("data-surface-context", "page")
        expect(surface).toHaveAttribute("data-verdict", "false")
        expect(container.querySelector("[data-component=\"SurfaceListCardBody\"]")?.className).not.toContain("rounded-none")
    })

    it("closes the list with the whole-list action when there is somewhere for it to go", () => {
        const act = vi.fn()
        render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, actionLabel: "See all standings", description: "Refreshed hourly" }}
                on={{ act }}
            />,
        )

        expect(screen.queryByText("Refreshed hourly")).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole("button", { name: /See all standings/ }))
        expect(act).toHaveBeenCalledOnce()
    })

    it("reserves the action's place while the list rests, before any outcome is wired", () => {
        const { container } = render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, actionLabel: "See all standings" }}
                isLoading
            />,
        )

        expect(screen.getByRole("button", { name: /See all standings/ })).toHaveAttribute("data-loading", "true")
        expect(container.querySelector("[data-node=\"next-action-row\"] button")).toHaveAttribute("data-loading", "true")
    })

    it("falls back to the description when the action would lead nowhere", () => {
        render(
            <SurfaceListCard
                contract="next-action-list"
                render={Rows}
                props={{ ...base, actionLabel: "See all standings", description: "Refreshed hourly" }}
            />,
        )

        expect(screen.queryByRole("button", { name: /See all standings/ })).not.toBeInTheDocument()
        expect(screen.getByText("Refreshed hourly")).toBeInTheDocument()
    })

    it("closes with nothing at all when the list has neither an action nor a description", () => {
        const { container } = render(<SurfaceListCard contract="next-action-list" render={Rows} props={base} />)

        const frame = container.querySelector("[data-component=\"SurfaceListCard\"]")
        expect(frame?.children).toHaveLength(2)
        expect(screen.queryByText("Refreshed hourly")).not.toBeInTheDocument()
    })
})
