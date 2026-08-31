import { act, render, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

type RendererInput = {
    props: { readonly saveDisabled?: boolean; readonly validationNotice?: string }
    on?: { readonly saveSettings?: () => void }
}

const mocks = vi.hoisted(() => ({
    input: undefined as RendererInput | undefined,
    workspace: {
        data: {
            task: { briefs: [], codeImplementations: [] },
            repository: { githubUrl: null as string | null, branch: null as string | null, tokenLast4: null as string | null },
            models: [],
        },
        mutate: vi.fn().mockResolvedValue(undefined),
    },
    settings: { isMutating: false, error: undefined as unknown, trigger: vi.fn().mockResolvedValue(true) },
}))

vi.mock("next-intl", () => ({ useLocale: () => "vi" }))
vi.mock("@/hooks/swr/useQueryPersonalProjectTaskWorkspaceSwr", () => ({
    useQueryPersonalProjectTaskWorkspaceSwr: () => mocks.workspace,
}))
vi.mock("@/hooks/swr/useMutateSyncPersonalProjectGithubSwr", () => ({
    useMutateSyncPersonalProjectGithubSwr: () => mocks.settings,
}))
vi.mock("./component", () => ({
    PersonalProjectGradingSettingsBlockBase: (input: RendererInput) => {
        mocks.input = input
        return <output data-testid="settings" />
    },
}))

import { PersonalProjectGradingSettingsBlock } from "./index"

describe("PersonalProjectGradingSettingsBlock", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.input = undefined
        mocks.workspace.data.repository.githubUrl = null
        mocks.workspace.data.repository.branch = null
        mocks.settings.error = undefined
        mocks.settings.isMutating = false
    })

    it("blocks a save that the backend would reject when no repository is known", () => {
        render(<PersonalProjectGradingSettingsBlock courseId="course-1" taskId="task-1" />)

        expect(mocks.input?.props.saveDisabled).toBe(true)
        expect(mocks.input?.props.validationNotice).toContain("bước 1")
        act(() => { mocks.input?.on?.saveSettings?.() })
        expect(mocks.settings.trigger).not.toHaveBeenCalled()
    })

    it("persists the live repository draft together with the grading settings", async () => {
        const onApplied = vi.fn()
        render(<PersonalProjectGradingSettingsBlock
            courseId="course-1"
            taskId="task-1"
            repositoryUrl="https://github.com/starci/live-draft"
            initialLanguage="typescript"
            initialModelId="openai:gpt-5"
            onApplied={onApplied}
        />)

        expect(mocks.input?.props.saveDisabled).toBe(false)
        act(() => { mocks.input?.on?.saveSettings?.() })
        await waitFor(() => expect(mocks.settings.trigger).toHaveBeenCalledWith({
            courseId: "course-1",
            githubUrl: "https://github.com/starci/live-draft",
            branch: "main",
            githubToken: undefined,
        }))
        await waitFor(() => expect(mocks.workspace.mutate).toHaveBeenCalledOnce())
        await waitFor(() => expect(onApplied).toHaveBeenCalledWith({ language: "typescript", modelId: "openai:gpt-5" }))
    })
})
