import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

/**
 * Artifact-local candidate build.
 *
 * The `@` alias points at the LOCKED target source so the candidate imports the real StarCi
 * leaves, composites, branches, contracts and tokens read-only instead of re-implementing them.
 * Nothing here is written back to the target.
 */
const TARGET_SRC = fileURLToPath(new URL("../../../../src", import.meta.url))

export default defineConfig({
    root: fileURLToPath(new URL(".", import.meta.url)),
    base: "./",
    plugins: [react()],
    resolve: {
        alias: { "@": TARGET_SRC },
    },
    build: {
        outDir: fileURLToPath(new URL("./dist", import.meta.url)),
        emptyOutDir: true,
    },
})
