import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { JudgeStatusStripBase } from "./component"
describe("JudgeStatusStripBase", () => { it("shows verdict and detail", () => { render(<JudgeStatusStripBase state="accepted" props={{ verdictLabel: "Accepted", detailLabel: "5/5" }} />); expect(screen.getByText("Accepted")).toBeInTheDocument(); expect(screen.getByText("5/5")).toBeInTheDocument() }); it("emits its action", () => { const act = vi.fn(); render(<JudgeStatusStripBase state="wrongAnswer" props={{ verdictLabel: "Wrong", actionLabel: "Retry" }} on={{ act }} />); fireEvent.click(screen.getByRole("button", { name: "Retry" })); expect(act).toHaveBeenCalledOnce() }) })
