import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type DrawerInput = { readonly placement: string; readonly chat: React.ComponentType }
type ChatInput = { readonly challengeTitle: string }

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/components/blocks/learn/CourseLearnAiChat", () => ({
    CourseLearnAiChat: ({ challengeTitle }: ChatInput) => <output>{challengeTitle}</output>,
}))
vi.mock("./component", () => ({
    CourseLearnAiDrawerBase: ({ placement, chat: Chat }: DrawerInput) => <><output>{placement}</output><Chat /></>,
}))

import { CourseLearnAiDrawer } from "./index"

beforeEach(() => {
    Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: false })) })
})

describe("CourseLearnAiDrawer", () => {
    it("uses a side drawer on desktop and binds the exact Challenge", () => {
        render(<CourseLearnAiDrawer isOpen displayId="course" courseId="course-1" challengeId="challenge" challengeTitle="Challenge title" onDismiss={vi.fn()} />)
        expect(screen.getByText("right")).toBeInTheDocument()
        expect(screen.getByText("Challenge title")).toBeInTheDocument()
    })

    it("uses a bottom drawer on compact screens", () => {
        Object.defineProperty(window, "matchMedia", { configurable: true, value: vi.fn(() => ({ matches: true })) })
        render(<CourseLearnAiDrawer isOpen displayId="course" challengeId="challenge" challengeTitle="Challenge" onDismiss={vi.fn()} />)
        expect(screen.getByText("bottom")).toBeInTheDocument()
    })
})
