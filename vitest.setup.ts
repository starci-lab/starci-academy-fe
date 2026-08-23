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

// Node 25 exposes an incomplete experimental `localStorage` unless it receives a backing-file
// flag. Vitest can surface that object inside jsdom, where component code reasonably expects the
// complete browser Storage contract. Install a deterministic in-memory implementation only when
// the environment did not provide that contract itself.
if (typeof window !== "undefined" && typeof window.localStorage?.clear !== "function") {
    const values = new Map<string, string>()
    const localStorage: Storage = {
        get length() {
            return values.size
        },
        clear: () => values.clear(),
        getItem: (key) => values.get(key) ?? null,
        key: (index) => Array.from(values.keys())[index] ?? null,
        removeItem: (key) => {
            values.delete(key)
        },
        setItem: (key, value) => {
            values.set(key, value)
        },
    }
    Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: localStorage,
    })
}

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

// jsdom ships no `ResizeObserver` either, and HeroUI's scroll-shadow hook subscribes to one the
// moment it mounts. A no-op observer is the honest stand-in: nothing in these tests resizes.
if (typeof window !== "undefined" && typeof window.ResizeObserver !== "function") {
    window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
    }
}
