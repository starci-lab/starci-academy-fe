import { spawn } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"

/**
 * Capture the LIVE page from the dev server, so the claim "it renders" has a picture behind it.
 *
 * Same mechanism as `capture-screens.mjs` and for the same reason: `--window-size` below ~500px is
 * clamped on Windows and the PNG is cropped, which invents a responsive failure that is not there.
 * `Emulation.setDeviceMetricsOverride` sets the layout viewport directly.
 */
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
const BASE = "http://localhost:3000/vi"
const OUT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2/screens/live"
const PORT = 9223

const STATES = [
    { id: "live-desktop", url: "courses/fullstack-mastery", width: 1280, height: 800, mobile: false },
    { id: "live-mobile", url: "courses/fullstack-mastery", width: 375, height: 812, mobile: true },
]

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))
const profile = `${tmpdir()}/starci-live-profile`
rmSync(profile, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank",
], { stdio: "ignore" })

await (async () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${PORT}/json/version`)
            if (response.ok) return
        } catch { /* not listening yet */ }
        await sleep(250)
    }
    throw new Error("Chrome never opened its debugging port")
})()

const connect = (wsUrl) => new Promise((ready, reject) => {
    const socket = new WebSocket(wsUrl)
    const pending = new Map()
    let nextId = 1
    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data)
        const settle = pending.get(message.id)
        if (settle === undefined) return
        pending.delete(message.id)
        if (message.error) settle.reject(new Error(message.error.message))
        else settle.resolve(message.result)
    })
    socket.addEventListener("error", reject)
    socket.addEventListener("open", () => ready({
        send: (method, params = {}) => new Promise((resolve, rejectInner) => {
            const id = nextId
            nextId += 1
            pending.set(id, { resolve, reject: rejectInner })
            socket.send(JSON.stringify({ id, method, params }))
        }),
        close: () => socket.close(),
    }))
})

for (const state of STATES) {
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json()
    const cdp = await connect(target.webSocketDebuggerUrl)
    await cdp.send("Page.enable")
    await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: state.width, height: state.height, deviceScaleFactor: 1, mobile: state.mobile,
    })
    await cdp.send("Page.navigate", { url: `${BASE}/${state.url}` })
    // The dev server compiles on first request and the page then fetches its course, so this waits
    // longer than the static export needed.
    await sleep(9000)

    const metrics = await cdp.send("Runtime.evaluate", {
        expression: "JSON.stringify({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,modules:document.querySelectorAll('ol[data-node=\"course-module-list\"] > li').length})",
        returnByValue: true,
    })
    const { cw, sw, sh, modules } = JSON.parse(metrics.result.value)

    const shot = await cdp.send("Page.captureScreenshot", {
        format: "png", captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: state.width, height: Math.min(sh, 6000), scale: 1 },
    })
    writeFileSync(`${OUT}/${state.id}.png`, Buffer.from(shot.data, "base64"))
    cdp.close()
    await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`)
    console.log(`${sw > cw ? "OVERFLOW" : "ok      "} ${state.id.padEnd(13)} layout ${cw}  scrollWidth ${sw}  height ${sh}  module rows ${modules}`)
}

chrome.kill()
try { rmSync(profile, { recursive: true, force: true }) } catch { /* released on the next run */ }
