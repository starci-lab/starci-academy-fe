"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadA2Outline } from "../../query"
import type { A2Task } from "../../types"

export const PersonalProjectTaskPage = ({ lang, displayId, taskId }: { lang: string; displayId: string; taskId: string }) => {
    const router = useRouter()
    const [task, setTask] = useState<A2Task | null>(null)
    const [failed, setFailed] = useState(false)
    useEffect(() => { const controller = new AbortController(); void loadA2Outline(displayId, controller.signal).then((outline) => setTask(outline?.milestones.flatMap((milestone) => milestone.tasks).find((item) => item.id === taskId) ?? null)).catch(() => setFailed(true)); return () => controller.abort() }, [displayId, taskId])
    if (failed) return <main className="mx-auto max-w-3xl px-4 py-10" role="alert">Task could not be loaded.</main>
    if (!task) return <main className="mx-auto max-w-3xl px-4 py-10" aria-busy="true"><div className="h-32 animate-pulse rounded-xl bg-slate-100" /></main>
    return <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><button className="mb-8 text-sm text-slate-500 hover:text-slate-900" onClick={() => router.push(`/${lang}/courses/${displayId}/learn/personal-project`)}>← Back to personal project</button><article><p className="text-sm font-medium text-slate-500">Personal Project task</p><h1 className="mt-2 text-3xl font-semibold text-slate-950">{task.title}</h1><p className="mt-3 text-slate-600">Complete this milestone task and submit your project for review.</p><section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-semibold text-slate-950">Your submission</h2><p className="mt-2 text-sm text-slate-600">Connect your GitHub project to submit this task for AI review.</p><button className="mt-5 rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white" onClick={() => router.push(`/${lang}/courses/${displayId}/learn/personal-project/tasks/${taskId}/result`)}>View latest result</button></section></article></main>
}
