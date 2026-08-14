import type { SandpackFiles } from "@codesandbox/sandpack-react"

/** One validated synchronized source snapshot ready for Sandpack. */
export type SandboxRepoSnapshot = {
    readonly files: SandpackFiles
    readonly dependencies: Readonly<Record<string, string>>
}

/** Exact code context produced by the controlled editor selection. */
export type SandboxCodeSelection = {
    readonly path: string
    readonly startLine: number
    readonly endLine: number
    readonly text: string
}

type UnknownRecord = Record<string, unknown>

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value)

const stringRecord = (value: unknown): Record<string, string> => {
    if (!isRecord(value)) return {}
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    )
}

/** Normalize a backend snapshot key to the absolute-style paths Sandpack expects. */
export const normalizeSandboxPath = (path: string): string => {
    const normalized = path.replace(/\\/g, "/").replace(/\/{2,}/g, "/")
    return normalized.startsWith("/") ? normalized : `/${normalized}`
}

/** Resolve the synchronized repository identity without ever fetching GitHub from the browser. */
export const sandboxRepoName = (githubBaseUrl: string): string => {
    const withoutQuery = githubBaseUrl.split(/[?#]/, 1)[0] ?? ""
    return withoutQuery.replace(/\/+$/, "").split("/").at(-1)?.replace(/\.git$/, "") ?? ""
}

/** Build the public MinIO object URL used by non-premium legacy sandbox lessons. */
export const publicSandboxRepoUrl = ({
    minioUrl,
    bucket,
    repoName,
    githubDir,
}: {
    readonly minioUrl: string
    readonly bucket: string
    readonly repoName: string
    readonly githubDir: string
}): string => `${minioUrl.replace(/\/$/, "")}/${bucket}/repo/${repoName}/${githubDir}.json`

/** Validate the JSON uploaded by RepoSynchronizerService and split package dependencies from files. */
export const parseSandboxRepoSnapshot = (raw: unknown): SandboxRepoSnapshot => {
    if (!isRecord(raw)) throw new Error("Sandbox repository snapshot is not an object")

    const files: SandpackFiles = {}
    let dependencies: Record<string, string> = {}

    for (const [rawPath, rawFile] of Object.entries(raw)) {
        if (!isRecord(rawFile) || typeof rawFile.code !== "string") continue
        const path = normalizeSandboxPath(rawPath)
        if (path === "/package.json") {
            try {
                const packageJson: unknown = JSON.parse(rawFile.code)
                if (isRecord(packageJson)) {
                    dependencies = {
                        ...stringRecord(packageJson.dependencies),
                        ...stringRecord(packageJson.devDependencies),
                    }
                }
            } catch {
                dependencies = {}
            }
            continue
        }
        files[path] = { code: rawFile.code }
    }

    if (Object.keys(files).length === 0) throw new Error("Sandbox repository snapshot has no text files")
    return { files, dependencies }
}

/** Read a file's current source from either Sandpack's string or object representation. */
export const sandboxFileCode = (files: SandpackFiles, path: string): string => {
    const file = files[normalizeSandboxPath(path)]
    return typeof file === "string" ? file : file?.code ?? ""
}

/** Infer the CodeMirror grammar from the active source path. */
export const sandboxLanguage = (path: string): "typescript" | "javascript" | "python" | "java" | "cpp" | "plain" => {
    const extension = path.toLowerCase().split(".").at(-1)
    if (extension === "ts" || extension === "tsx") return "typescript"
    if (extension === "js" || extension === "jsx" || extension === "mjs" || extension === "cjs") return "javascript"
    if (extension === "py") return "python"
    if (extension === "java") return "java"
    if (extension === "cpp" || extension === "cc" || extension === "cxx" || extension === "h" || extension === "hpp") return "cpp"
    return "plain"
}

/** Rewrite only the legacy browser-runtime environment seams; local edits never leave the browser. */
export const rewriteSandboxSource = (code: string, mockApiBase: string): string => code
    .replace(/import\.meta\.env\.VITE_API_BASE/g, JSON.stringify(mockApiBase))
    .replace(/import\.meta\.env\.\w+/g, "\"\"")
    .replace(/import\.meta\.env/g, "({})")
    .replace(/import\.meta\.hot[^\n]*/g, "undefined")
    .replace(/@import\s+["']tailwindcss["'];?/g, "")
    .replace(/@import\s+["']@heroui\/styles["'];?/g, "")
