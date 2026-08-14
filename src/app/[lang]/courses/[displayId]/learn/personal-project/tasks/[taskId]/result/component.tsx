"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadA2Attempts, loadA2Feedback, loadA2Outline } from "../../../query"
import type { A2Attempt, A2Feedback } from "../../../types"

export const PersonalProjectTaskResultPage = ({ lang, displayId, taskId }: { lang: string; displayId: string; taskId: string }) => {
    const router = useRouter()
    const [title, setTitle] = useState("Task result")
    const [attempts, setAttempts] = useState<A2Attempt[]>([])
    const [feedback, setFeedback] = useState<A2Feedback[]>([])
    const [error, setError] = useState(false)
    useEffect(() => { const controller = new AbortController(); void loadA2Outline(displayId, controller.signal).then(async (outline) => { const task = outline?.milestones.flatMap((milestone) => milestone.tasks).find((item) => item.id === taskId); if (task) setTitle(task.title); const nextAttempts = outline?.course.id ? await loadA2Attempts(outline.course.id, taskId, controller.signal) : []; setAttempts(nextAttempts); const latest = nextAttempts[0]; if (latest) setFeedback(await loadA2Feedback(latest.id, controller.signal)) }).catch(() => setError(true)); return () => controller.abort() }, [displayId, taskId])
    const latest = attempts[0]
    return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><button className="mb-8 text-sm text-slate-500 hover:text-slate-900" onClick={() => router.push(`/${lang}/courses/${displayId}/learn/personal-project/tasks/${taskId}`)}>← Back to task</button><header><p className="text-sm font-medium text-slate-500">Result</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1></header>{error && <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-red-900">Result could not be loaded.</p>}{!error && !latest && <section className="mt-8 rounded-xl border border-dashed border-slate-300 p-8 text-center"><h2 className="font-semibold text-slate-900">No submission yet</h2><p className="mt-2 text-sm text-slate-600">Submit the task to see your score and feedback here.</p></section>}{latest && <div className="mt-8 space-y-5"><section className={`rounded-xl border p-6 ${latest.passed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><p className="text-sm font-medium">Attempt {latest.attemptNumber}</p><p className="mt-3 text-4xl font-semibold">{latest.score}</p><p className="mt-1 text-sm">{latest.passed ? "Passed" : "Needs another pass"}</p>{latest.shortFeedback && <p className="mt-4 text-sm">{latest.shortFeedback}</p>}</section><section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-950">Feedback</h2>{feedback.length === 0 ? <p className="mt-3 text-sm text-slate-600">No detailed feedback for this attempt.</p> : <ul className="mt-4 space-y-4">{feedback.sort((a, b) => a.sortIndex - b.sortIndex).map((item) => <li key={item.id} className="border-l-2 border-slate-200 pl-4"><p className="text-sm text-slate-900">{item.message}</p>{item.suggestion && <p className="mt-1 text-sm text-slate-600">{item.suggestion}</p>}</li>)}</ul>}</section></div>}</main>
}
