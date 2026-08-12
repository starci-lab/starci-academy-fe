import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { _ProfileChallengeSubmissionPage } from "./component"

describe("_ProfileChallengeSubmissionPage", () => {
    it("keeps submitted proof, attempts and structured feedback in legacy order", () => {
        const html = renderToStaticMarkup(<_ProfileChallengeSubmissionPage state="ready" detail={{ title: "Resilient checkout", courseTitle: "Frontend Engineering", submissionUrl: "https://example.com/proof", attempts: [{ attemptNumber: 3, score: 94 }], feedbacks: [{ message: "Reliability", severity: "Strong" }] }} onBack={vi.fn()} />)
        expect(html.indexOf("Submitted proof")).toBeLessThan(html.indexOf("Attempts"))
        expect(html.indexOf("Attempts")).toBeLessThan(html.indexOf("Structured feedback"))
        expect(html).toContain("https://example.com/proof")
    })
})
