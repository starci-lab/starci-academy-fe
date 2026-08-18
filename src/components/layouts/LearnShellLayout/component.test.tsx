import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { _LearnShellLayout, type LearnShellLayoutData } from "./component"

const Surface = () => <div>Reader surface</div>

const spine: LearnShellLayoutData["spine"] = {
    lockedLabel: "Locked",
    groups: [{
        id: "path",
        label: "Path",
        rows: [{ id: "content", label: "Modules", icon: "course", isCurrent: true }],
    }],
}

describe("_LearnShellLayout", () => {
    it("keeps the course spine beside an ordinary routed surface", () => {
        const { container } = render(
            <_LearnShellLayout props={{ spine, isFullBleed: false }} surface={<Surface />} />,
        )

        expect(screen.getByText("Reader surface")).toBeTruthy()
        expect(container.querySelector("[data-node=learn-spine-column]")).not.toBeNull()
    })

    it("removes course furniture for a focused full-bleed session", () => {
        const { container } = render(
            <_LearnShellLayout props={{ spine, isFullBleed: true }} surface={<Surface />} />,
        )

        expect(screen.getByText("Reader surface")).toBeTruthy()
        expect(container.querySelector("[data-node=learn-spine-column]")).toBeNull()
    })

    it("reports mobile view changes through the dedicated action", () => {
        const openMobileTab = vi.fn()
        render(
            <_LearnShellLayout
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
            <_LearnShellLayout props={{ spine, isFullBleed: false, mobileTabs: [] }} surface={<Surface />} />,
        )

        expect(container.querySelector("[data-node=learn-mobile-tab-bar]")).toBeNull()
        expect(container.querySelector("[data-node=learn-spine-column]")).not.toBeNull()
    })

    it("rests the resume card in the spine while the course is still arriving", () => {
        const { container } = render(
            <_LearnShellLayout
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
