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

    it("refuses a string and an array where an object snapshot was promised", () => {
        expect(() => parseSandboxRepoSnapshot("{}")).toThrow("not an object")
        expect(() => parseSandboxRepoSnapshot([])).toThrow("not an object")
    })

    it("skips entries that are not files rather than writing them into the editor", () => {
        const result = parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "/src/notes": "plain string",
            "/src/binary": { code: 12 },
        })
        expect(Object.keys(result.files)).toEqual(["/src/App.tsx"])
    })

    it("leaves dependencies empty when package.json is not parseable JSON", () => {
        const result = parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "package.json": { code: "{ not json" },
        })
        expect(result.dependencies).toEqual({})
    })

    it("leaves dependencies empty when package.json parses to something that is not an object", () => {
        expect(parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "/package.json": { code: "[1,2]" },
        }).dependencies).toEqual({})
        expect(parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "/package.json": { code: "null" },
        }).dependencies).toEqual({})
    })

    it("keeps only string version ranges and tolerates a missing dependency block", () => {
        expect(parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "/package.json": { code: JSON.stringify({ dependencies: { react: "^19.0.0", bad: 3 } }) },
        }).dependencies).toEqual({ react: "^19.0.0" })
        expect(parseSandboxRepoSnapshot({
            "/src/App.tsx": { code: "ok" },
            "/package.json": { code: JSON.stringify({ name: "app", devDependencies: "none" }) },
        }).dependencies).toEqual({})
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

    it("neutralizes the bare env object, the hot handle and the bundler-only imports", () => {
        expect(rewriteSandboxSource("const env = import.meta.env", "http://mock")).toBe("const env = ({})")
        expect(rewriteSandboxSource("import.meta.hot.accept()\nnext()", "http://mock"))
            .toBe("undefined\nnext()")
        expect(rewriteSandboxSource("@import \"tailwindcss\";\nbody {}", "http://mock"))
            .toBe("\nbody {}")
        expect(rewriteSandboxSource("@import '@heroui/styles';\nbody {}", "http://mock"))
            .toBe("\nbody {}")
    })

    it("strips the query, the trailing slashes and the .git suffix from a repository url", () => {
        expect(sandboxRepoName("https://github.com/StarCi-Academy/course?tab=readme")).toBe("course")
        expect(sandboxRepoName("https://github.com/StarCi-Academy/course#readme")).toBe("course")
        expect(sandboxRepoName("https://github.com/StarCi-Academy/course///")).toBe("course")
        expect(sandboxRepoName("")).toBe("")
    })

    it("joins a MinIO base that already ends in a slash and one that does not", () => {
        const input = { bucket: "b", repoName: "r", githubDir: "d" }
        expect(publicSandboxRepoUrl({ ...input, minioUrl: "http://m" })).toBe("http://m/b/repo/r/d.json")
        expect(publicSandboxRepoUrl({ ...input, minioUrl: "http://m/" })).toBe("http://m/b/repo/r/d.json")
    })

    it("collapses repeated separators and prefixes a relative snapshot key", () => {
        expect(normalizeSandboxPath("/already/absolute.ts")).toBe("/already/absolute.ts")
        expect(normalizeSandboxPath("src//deep///a.ts")).toBe("/src/deep/a.ts")
    })

    it("answers with empty source for a file the snapshot does not carry", () => {
        expect(sandboxFileCode({ "/src/App.tsx": { code: "object form" } }, "src/App.tsx")).toBe("object form")
        expect(sandboxFileCode({}, "/missing.ts")).toBe("")
    })

    it.each([
        ["/a.ts", "typescript"],
        ["/a.tsx", "typescript"],
        ["/a.js", "javascript"],
        ["/a.jsx", "javascript"],
        ["/a.mjs", "javascript"],
        ["/a.cjs", "javascript"],
        ["/a.py", "python"],
        ["/a.java", "java"],
        ["/a.cpp", "cpp"],
        ["/a.cc", "cpp"],
        ["/a.cxx", "cpp"],
        ["/a.h", "cpp"],
        ["/a.hpp", "cpp"],
        ["/a.MD", "plain"],
    ] as const)("reads %s as the %s grammar", (path, language) => {
        expect(sandboxLanguage(path)).toBe(language)
    })
})
