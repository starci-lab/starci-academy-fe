import type { PropsWithChildren, ReactNode } from "react"
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ConceptDetail } from "@/modules/api/graphql/queries/types/concept"

type NoticeStubProps = { readonly message: string }
type CardStubProps = PropsWithChildren<{ readonly label?: string; readonly fact?: string }>
type TabsStubProps = { readonly items: ReadonlyArray<{ readonly id: string; readonly label: string }> }
type WorkspaceStubProps = { readonly navigation: ReactNode; readonly primary: ReactNode; readonly rail: ReactNode; readonly compactNavigation: ReactNode }
type ArticleStubProps = { readonly props: { readonly body: string } }
type CodeStubProps = { readonly props: { readonly code: string } }
type SelectionStubProps = { readonly props: { readonly items: ReadonlyArray<{ readonly id: string; readonly title: string }> } }

vi.mock("@starci/grammar/common", () => ({
    Badge: ({ children }: PropsWithChildren) => <span>{children}</span>,
    EmptyNotice: ({ message }: NoticeStubProps) => <p>{message}</p>,
    Heading: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
    PageContainer: ({ children }: PropsWithChildren) => <div>{children}</div>,
    SurfaceCard: ({ children, label, fact }: CardStubProps) => <section><b>{label}</b><i>{fact}</i>{children}</section>,
    Tabs: ({ items }: TabsStubProps) => <div>{items.map((item) => <span key={item.id}>{item.label}</span>)}</div>,
    Text: ({ children }: PropsWithChildren) => <span>{children}</span>,
    WorkspaceShell: ({ navigation, primary, rail, compactNavigation }: WorkspaceStubProps) => <div>{navigation}{compactNavigation}{primary}{rail}</div>,
}))
vi.mock("@/components/branches/Article", () => ({ Article: ({ props }: ArticleStubProps) => <article data-body={props.body}>{props.body}</article> }))
vi.mock("@/components/branches/MarkdownCodeBlock", () => ({ MarkdownCodeBlock: ({ props }: CodeStubProps) => <pre>{props.code}</pre> }))
vi.mock("@/components/leaves/Icon", () => ({ Icon: () => null, iconSourceFor: () => ({}) }))
vi.mock("@/components/leaves/SelectionList", () => ({ SelectionList: ({ props }: SelectionStubProps) => <nav>{props.items.map((item) => <span key={item.id}>{item.title}</span>)}</nav> }))

import { ConceptDetailPageBase, type ConceptDetailLabels } from "./component"

const labels: ConceptDetailLabels = {
    back: "Back", loadingTitle: "Loading", loadingDescription: "Loading copy", failed: "Failed", missing: "Missing", retry: "Retry",
    minutes: (count) => `${count} min`, overview: "Overview", overviewPosition: "Overview position", path: "Lesson path",
    position: (current, total) => `${current}/${total}`, tabs: { group: "Materials", lesson: "Lesson", source: "Source", practice: "Practice" },
    outcomes: "Outcomes", prerequisites: "Prerequisites", sources: "Source workspace", sourceUnavailable: "No source", runCommand: "Run",
    practice: "Practice prompts", practiceUnavailable: "No grading", currentPrompt: "Current prompt", references: "References", noActivities: "No prompts",
    diagnostic: "Diagnostic", delayed: (days) => `${days} days`, category: (value) => value, difficulty: (value) => value,
    phase: (value) => value === "challenge" ? "Interview context" : value, activity: (value) => value,
}

const concept: ConceptDetail = {
    displayId: "request-response-lifecycle", title: "Request lifecycle", description: "Trace one request.", category: "backend",
    difficulty: "foundation", minutesRead: 12, implementation: "NestJS", sortIndex: 1, body: "Overview body", learningOutcomes: [], prerequisites: [],
    references: [{ id: "ref", label: "A printed reference", url: null }],
    workspace: {
        runtime: "node", commands: { windows: null, unix: "node --test workspace/source.test.ts" },
        files: [
            { path: "workspace/source.ts", role: "source", content: null },
            { path: "workspace/source.test.ts", role: "test", content: "test('request lifecycle', () => {})" },
        ],
    },
    activities: [],
    sections: [{
        displayId: "interview-context", title: "Interview context", phase: "challenge", body: "What happens before the controller?", sortIndex: 1,
        activities: [
            { id: "question", kind: "choice", prompt: "Which stage runs first?", afterDays: null, exercise: null, options: [{ id: "a", label: "Middleware" }] },
            { id: "exercise", kind: "exercise", prompt: "Trace the request.", exercise: { submissionInstructions: " Trace the request. ", verificationMode: "command", verificationInstructions: "Run the public test." } },
        ],
    }],
    capabilities: { choiceSubmission: false, writtenResponseGrading: false, simulationExecution: false },
}

const renderReader = (selectedTab: "lesson" | "source" | "practice") => render(
    <ConceptDetailPageBase state="ready" concept={concept} selectedSectionId="interview-context" selectedTab={selectedTab} catalogHref="/en/concept" labels={labels} />,
)

describe("ConceptDetailPageBase", () => {
    it("renders the authored first lesson and friendly phase without exposing enum jargon", () => {
        renderReader("lesson")
        expect(screen.getAllByText("Interview context").length).toBeGreaterThan(0)
        expect(screen.getByText("What happens before the controller?")).toBeInTheDocument()
    })

    it("shows runnable public source and test content while omitting null snapshots", () => {
        renderReader("source")
        expect(screen.getByText("node --test workspace/source.test.ts")).toBeInTheDocument()
        expect(screen.getByText("test('request lifecycle', () => {})")).toBeInTheDocument()
        expect(screen.queryByText("workspace/source.ts")).not.toBeInTheDocument()
        expect(screen.queryByText("A printed reference")).not.toBeInTheDocument()
    })

    it("renders nullable read-only practice data without claiming a grade", () => {
        renderReader("practice")
        expect(screen.getAllByText("Which stage runs first?").length).toBeGreaterThan(0)
        expect(screen.getAllByText("Middleware").length).toBeGreaterThan(0)
        expect(screen.getAllByText("No grading").length).toBeGreaterThan(0)
        expect(screen.queryByText("null days")).not.toBeInTheDocument()
        const renderedBodies = Array.from(document.querySelectorAll("article")).map((node) => node.getAttribute("data-body"))
        expect(renderedBodies).not.toContain("Trace the request.\n\nRun the public test.")
        expect(renderedBodies).toContain("Run the public test.")
        expect(screen.queryByRole("button", { name: /submit|check/i })).not.toBeInTheDocument()
    })

    it("renders a distinct missing state", () => {
        render(<ConceptDetailPageBase state="missing" concept={null} selectedSectionId="overview" selectedTab="lesson" catalogHref="/en/concept" labels={labels} />)
        expect(screen.getByText("Missing")).toBeInTheDocument()
    })
})
