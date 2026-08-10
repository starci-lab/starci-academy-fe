import "@testing-library/jest-dom/vitest"
import {
    cleanup,
} from "@testing-library/react"
import {
    afterEach,
} from "vitest"

// Unmount anything a test rendered, so one test's DOM never leaks into the next
// and a query like getByRole cannot match a stale tree.
afterEach(() => {
    cleanup()
})

// jsdom ships no `matchMedia`, and `next-themes` asks for it the moment it mounts to learn what
// the operating system prefers. Answering "no preference, and nothing is listening" is the honest
// stand-in: a test asserting on a theme sets the theme rather than pretending to be an OS.
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
    window.matchMedia = (query: string): MediaQueryList => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
    })
}
