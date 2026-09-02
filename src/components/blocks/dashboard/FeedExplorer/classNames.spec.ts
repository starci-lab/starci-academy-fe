import { describe, expect, it } from "vitest"
import { feedExplorerContinuationClassName, feedExplorerNavigationClassName } from "./classNames"

describe("FeedExplorer spacing", () => {
    it("distinguishes outer card edges from divider-facing edges", () => {
        expect(feedExplorerNavigationClassName).toContain("px-4")
        expect(feedExplorerNavigationClassName).toContain("pt-4")
        expect(feedExplorerNavigationClassName).toContain("pb-3")
        expect(feedExplorerContinuationClassName).toContain("px-4")
        expect(feedExplorerContinuationClassName).toContain("pt-3")
        expect(feedExplorerContinuationClassName).toContain("pb-4")
    })
})
