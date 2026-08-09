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
