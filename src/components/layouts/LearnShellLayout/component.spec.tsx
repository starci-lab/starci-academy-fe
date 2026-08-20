import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LearnShellLayoutBase, type LearnShellLayoutData } from "./component"

const Surface = () => <div>Reader surface</div>

const spine: LearnShellLayoutData["spine"] = {
    lockedLabel: "Locked",
    collapseLabel: "Collapse",
    expandLabel: "Expand",
    isCollapsed: false,
    groups: [{
        id: "path",
        label: "Path",
        rows: [{ id: "content", label: "Modules", icon: "course", isCurrent: true }],
    }],
}

describe("LearnShellLayoutBase", () => {
    it("keeps the course spine beside an ordinary routed surface", () => {
        const { container } = render(
            <LearnShellLayoutBase props={{ spine, isFullBleed: false }} surface={<Surface />} />,
        )

        expect(screen.getByText("Reader surface")).toBeTruthy()
        expect(container.querySelector("[data-node=learn-course-navigation-rail]")).not.toBeNull()
        expect(container.querySelector("[data-node=learn-routed-body]")).not.toBeNull()
    })

    it("removes course furniture for a focused full-bleed session", () => {
        const { container } = render(
            <LearnShellLayoutBase props={{ spine, isFullBleed: true }} surface={<Surface />} />,
        )

        expect(screen.getByText("Reader surface")).toBeTruthy()
        expect(container.querySelector("[data-node=learn-course-navigation-rail]")).toBeNull()
    })

    it("compacts the rail to its icon-only contract", () => {
        const { container } = render(
            <LearnShellLayoutBase props={{ spine: { ...spine, isCollapsed: true }, isFullBleed: false }} surface={<Surface />} />,
        )

        expect(container.querySelector("[data-node=learn-shell-frame-collapsed]")).not.toBeNull()
        expect(container.querySelector("[data-node=learn-course-navigation-rail-collapsed]")).not.toBeNull()
        expect(screen.getByRole("button", { name: "Expand" })).toBeInTheDocument()
    })

    it("reports mobile view changes through the dedicated action", () => {
        const openMobileTab = vi.fn()
        render(
            <LearnShellLayoutBase
                props={{
                    spine,
                    isFullBleed: false,
                    mobileTabs: [
                        { id: "contents", label: "Contents", icon: "explore" },
                        { id: "lesson", label: "Lesson", icon: "course", isCurrent: true },
                        { id: "outline", label: "This page", icon: "blog" },
                    ],
                }}
                on={{ openMobileTab }}
                surface={<Surface />}
            />,
        )

        fireEvent.click(screen.getByText("Contents"))
        expect(openMobileTab).toHaveBeenCalledWith("contents")
    })

    it("draws no bottom bar for a surface that contributes no mobile panels", () => {
        const { container } = render(
            <LearnShellLayoutBase props={{ spine, isFullBleed: false, mobileTabs: [] }} surface={<Surface />} />,
        )

        expect(container.querySelector("[data-node=learn-mobile-tab-bar]")).toBeNull()
        expect(container.querySelector("[data-node=learn-course-navigation-rail]")).not.toBeNull()
    })

    it("rests the resume card in the spine while the course is still arriving", () => {
        const { container } = render(
            <LearnShellLayoutBase
                props={{
                    spine: { ...spine, resume: { label: "Continue", title: "Module 2", percent: 40, percentText: "2/5" } },
                    isFullBleed: false,
                }}
                surface={<Surface />}
                isLoading
            />,
        )

        expect(container.querySelector("[data-node=learn-resume-card]")).not.toBeNull()
        expect(container.querySelectorAll("[data-loading=\"true\"]").length).toBeGreaterThan(0)
        expect(screen.getByText("Reader surface")).toBeTruthy()
    })
})
