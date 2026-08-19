import {spawn} from "node:child_process"

const port = process.env.E2E_PORT ?? "3101"
const baseUrl = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`
const external = Boolean(process.env.E2E_BASE_URL)
let server

const stop = () => {
    if (server && !server.killed) server.kill("SIGTERM")
}
process.once("SIGINT", stop)
process.once("SIGTERM", stop)

const waitForServer = async () => {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${baseUrl}/en`)
            if (response.status < 500) return response
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 250))
        }
    }
    throw new Error(`Next.js did not become ready at ${baseUrl}`)
}

try {
    if (!external) {
        server = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "start", "--", "--hostname", "127.0.0.1", "--port", port], {
            cwd: process.cwd(),
            stdio: "inherit",
            env: {...process.env, PORT: port},
            shell: process.platform === "win32",
        })
    }
    await waitForServer()
    const test = spawn(process.execPath, ["tests/e2e/application-shell.test.mjs"], {
        cwd: process.cwd(),
        stdio: "inherit",
        env: {...process.env, E2E_BASE_URL: baseUrl},
    })
    await new Promise((resolve, reject) => {
        test.once("error", reject)
        test.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`E2E smoke exited with ${code}`)))
    })
} finally {
    stop()
}
