import { spawn } from "node:child_process"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"

/**
 * Capture one full-document screenshot per rendered state, at the exact viewport the design record
 * declares.
 *
 * WHY NOT `chrome --headless --screenshot --window-size=375,812`, WHICH WAS TRIED FIRST. Windows
 * clamps a window to a minimum width near 500px, so headless laid the page out at that width and
 * then cropped the PNG to the 375 that was asked for. The result looks exactly like a responsive
 * failure - chips running off the edge, promise text clipped, the CTA gone - and the page has none
 * of those: measured in a real browser at 375, documentElement.scrollWidth is 375 and zero elements
 * extend past it. A screenshot that invents a defect is worse than no screenshot, because somebody
 * will fix the page.
 *
 * Emulation.setDeviceMetricsOverride sets the LAYOUT viewport directly and is not subject to any
 * window minimum, which is the whole reason this drives the protocol instead of the command line.
 *
 * No dependency is added anywhere: Chrome is already installed and Node 22+ ships a global WebSocket.
 */

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
const BASE = "http://127.0.0.1:8096/candidate/out"
const OUT = "D:/Repositories/starci-academy-fe/.artifacts/design-plan/course-detail-page-v2/screens"
const PORT = 9222

const STATES = [
    { id: "ready", url: "state/ready.html", width: 1280, height: 800, mobile: false },
    { id: "ready-mobile", url: "state/ready.html", width: 375, height: 812, mobile: true },
    { id: "price-pending", url: "state/price-pending.html", width: 1280, height: 800, mobile: false },
    { id: "no-ladder", url: "state/no-ladder.html", width: 1280, height: 800, mobile: false },
    { id: "pending", url: "state/pending.html", width: 1280, height: 800, mobile: false },
    { id: "not-found", url: "state/not-found.html", width: 1280, height: 800, mobile: false },
    { id: "failed", url: "state/failed.html", width: 1280, height: 800, mobile: false },
]

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

const profile = `${tmpdir()}/starci-cdp-profile`
rmSync(profile, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
], { stdio: "ignore" })

/** Wait for the debugging endpoint rather than guessing how long Chrome takes to start. */
const endpoint = await (async () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            const response = await fetch(`http://127.0.0.1:${PORT}/json/version`)
            if (response.ok) return await response.json()
        } catch { /* not listening yet */ }
        await sleep(250)
    }
    throw new Error("Chrome never opened its debugging port")
})()
console.log(`driving ${endpoint.Browser}`)

/** One CDP session over a target's WebSocket, with ids matched to their replies. */
const connect = (wsUrl) => new Promise((ready, reject) => {
    const socket = new WebSocket(wsUrl)
    const pending = new Map()
    let nextId = 1
    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data)
        const settle = pending.get(message.id)
        if (settle === undefined) return
        pending.delete(message.id)
        if (message.error) settle.reject(new Error(`${message.method}: ${message.error.message}`))
        else settle.resolve(message.result)
    })
    socket.addEventListener("error", reject)
    socket.addEventListener("open", () => ready({
        send: (method, params = {}) => new Promise((resolve, reject2) => {
            const id = nextId
            nextId += 1
            pending.set(id, { resolve, reject: reject2, method })
            socket.send(JSON.stringify({ id, method, params }))
        }),
        close: () => socket.close(),
    }))
})

const rows = []
for (const state of STATES) {
    const target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json()
    const cdp = await connect(target.webSocketDebuggerUrl)
    await cdp.send("Page.enable")
    await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: state.width,
        height: state.height,
        deviceScaleFactor: 1,
        mobile: state.mobile,
    })
    await cdp.send("Page.navigate", { url: `${BASE}/${state.url}` })
    // React hydrates after load; a frame taken before that is the server HTML, which looks almost
    // right and is not what a reviewer looked at.
    await sleep(2500)

    const metrics = await cdp.send("Runtime.evaluate", {
        expression: "JSON.stringify({cw:document.documentElement.clientWidth,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})",
        returnByValue: true,
    })
    const { cw, sw, sh } = JSON.parse(metrics.result.value)

    const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: state.width, height: sh, scale: 1 },
    })
    writeFileSync(`${OUT}/${state.id}.png`, Buffer.from(shot.data, "base64"))
    cdp.close()
    await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`)

    const overflows = sw > cw
    rows.push({ id: state.id, cw, sw, sh, overflows })
    console.log(`${overflows ? "OVERFLOW" : "ok      "} ${state.id.padEnd(14)} viewport ${state.width}x${state.height}  layout ${cw}  scrollWidth ${sw}  document height ${sh}`)
}

chrome.kill()
// Chrome releases its profile lock asynchronously, so a delete here loses a race it does not need to
// win: the next run wipes the directory before starting. Failing the whole capture over leftover
// scratch would throw away seven good screenshots.
try { rmSync(profile, { recursive: true, force: true }) } catch { /* released on the next run */ }
console.log(`\nstates captured: ${rows.length}, horizontal overflow: ${rows.filter((r) => r.overflows).length}`)
