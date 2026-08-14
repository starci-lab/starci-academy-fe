import { describe, expect, it } from "vitest"
import {
    normalizeSandboxPath,
    parseSandboxRepoSnapshot,
    publicSandboxRepoUrl,
    rewriteSandboxSource,
    sandboxFileCode,
    sandboxLanguage,
    sandboxRepoName,
} from "./sandbox-repo"

describe("sandbox repository snapshot", () => {
    it("normalizes paths and extracts legacy package dependencies without mutating the input", () => {
        const raw = {
            "src\\App.tsx": { code: "export default function App() {}" },
            "/package.json": { code: JSON.stringify({
                dependencies: { react: "^19.0.0" },
                devDependencies: { typescript: "^5.0.0" },
            }) },
        }

        const result = parseSandboxRepoSnapshot(raw)

        expect(result.files).toEqual({ "/src/App.tsx": { code: "export default function App() {}" } })
        expect(result.dependencies).toEqual({ react: "^19.0.0", typescript: "^5.0.0" })
        expect(raw["/package.json"]).toBeDefined()
    })

    it("rejects empty or malformed snapshots instead of rendering a blank editor", () => {
        expect(() => parseSandboxRepoSnapshot(null)).toThrow("not an object")
        expect(() => parseSandboxRepoSnapshot({ "/image.png": { bytes: "binary" } })).toThrow("no text files")
    })
})

describe("sandbox source helpers", () => {
    it("keeps public source on the synchronized MinIO snapshot", () => {
        expect(sandboxRepoName("https://github.com/StarCi-Academy/course.git/")).toBe("course")
        expect(publicSandboxRepoUrl({
            minioUrl: "http://localhost:9000/",
            bucket: "starci-academy",
            repoName: "course",
            githubDir: "lesson/frontend",
        })).toBe("http://localhost:9000/starci-academy/repo/course/lesson/frontend.json")
    })

    it("reads both Sandpack file representations and selects an editor grammar", () => {
        expect(normalizeSandboxPath("src\\App.tsx")).toBe("/src/App.tsx")
        expect(sandboxFileCode({ "/src/App.tsx": "source" }, "/src/App.tsx")).toBe("source")
        expect(sandboxLanguage("/src/App.tsx")).toBe("typescript")
        expect(sandboxLanguage("/README.md")).toBe("plain")
    })

    it("rewrites only browser-runtime environment seams", () => {
        const source = "const api = import.meta.env.VITE_API_BASE\nconst other = import.meta.env.SECRET"
        expect(rewriteSandboxSource(source, "http://mock/session/1")).toBe(
            "const api = \"http://mock/session/1\"\nconst other = \"\"",
        )
    })
})
