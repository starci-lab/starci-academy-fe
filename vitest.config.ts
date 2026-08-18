import {
    fileURLToPath,
} from "node:url"
import react from "@vitejs/plugin-react"
import {
    defineConfig,
} from "vitest/config"

/**
 * Vitest configuration for the twin-test convention: every source file has a
 * sibling `*.test.ts(x)` beside it, so tests are discovered from `src/` rather
 * than from a separate test root.
 *
 * `jsdom` gives the component tests a DOM; `vitest.setup.ts` installs the
 * jest-dom matchers. The `@/` alias mirrors the one in `tsconfig.json` so a test
 * imports a module by exactly the path the source does.
 */
export default defineConfig({
    plugins: [
        react(),
    ],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: [
            "./vitest.setup.ts",
        ],
        include: [
            "src/**/*.test.{ts,tsx}",
        ],
        coverage: {
            provider: "v8",
            reporter: [
                "text-summary",
                "lcov",
            ],
            reportsDirectory: "coverage",
            /*
             * WITHOUT `include`, v8 reports only the files a test actually loaded, so a file
             * nobody imports is absent from the denominator rather than counted as uncovered.
             * Measured here: 484 files in the report against 653 real source files - 169 files
             * scored nothing at all, and the headline read 99.21% lines while SonarQube, which
             * analyses the whole of `src`, read 81.6%. The analyser was right.
             *
             * Naming the surface explicitly makes the local number mean the same thing as the
             * analysed one. It moves the reported figure DOWN, which is the point: an untested
             * file is uncovered, not invisible.
             */
            include: [
                "src/**/*.{ts,tsx}",
            ],
            exclude: [
                "src/**/*.test.{ts,tsx}",
                "src/**/*.d.ts",
            ],
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
})
