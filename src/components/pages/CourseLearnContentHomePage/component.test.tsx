import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CourseLearnContentHomePageBase } from "./component"

describe("CourseLearnContentHomePageBase", () => {
    it("opens the selected module from the legacy curriculum entry", () => {
        const onModule = vi.fn()
        render(
            <CourseLearnContentHomePageBase
                state="ready"
                labels={{ title: "Course", description: "Description", modules: "Modules", moduleCount: "1 module" }}
                modules={[{
                    id: "module-1",
                    title: "Async patterns",
                    orderIndex: 1,
                    contentTier: "foundation",
                    numContents: 3,
                }]}
                onModule={onModule}
            />,
        )

        fireEvent.click(screen.getByRole("button", { name: /Async patterns/u }))
        expect(onModule).toHaveBeenCalledWith("module-1")
    })
})
