"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { loadA2Outline } from "./query"
import type { A2Milestone, A2State } from "./types"

const copy = {
    title: "Personal Project",
    description: "Build and submit your project step by step.",
    progress: "Completion progress",
    continue: "Continue",
    next: "Next task",
    completed: "Completed",
    locked: "Locked",
    notStarted: "Not started",
    empty: "No tasks yet",
    emptyDescription: "This course's personal project has no milestones or tasks yet.",
    error: "Personal project could not be loaded.",
    retry: "Try again",
}

const taskState = (task: { completed: boolean; id: string }, currentId?: string | null) =>
    task.completed ? copy.completed : task.id === currentId ? copy.next : copy.notStarted

export const PersonalProjectPage = ({ lang, displayId }: { lang: string; displayId: string }) => {
    const router = useRouter()
    const [state, setState] = useState<A2State>("pending")
    const [milestones, setMilestones] = useState<A2Milestone[]>([])
    const [progress, setProgress] = useState({ tasksCompleted: 0, tasksTotal: 0, completionPercent: 0 })

    const load = () => {
        setState("pending")
        const controller = new AbortController()
        void loadA2Outline(displayId, controller.signal).then((outline) => {
            if (!outline) { setState("empty"); return }
            setMilestones(outline.milestones)
            setProgress(outline.progress)
            setState(outline.milestones.some((milestone) => milestone.tasks.length > 0) ? "ready" : "empty")
        }).catch((error: unknown) => {
            if (error instanceof DOMException && error.name === "AbortError") return
            setState("error")
        })
        return () => controller.abort()
    }

    useEffect(load, [displayId])

    const currentId = useMemo(() => milestones.flatMap((milestone) => milestone.tasks).find((task) => !task.completed)?.id, [milestones])
    const openTask = (taskId: string) => router.push(`/${lang}/courses/${displayId}/learn/personal-project/tasks/${taskId}`)

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500"><a href={`/${lang}/courses/${displayId}/learn/content`} className="hover:text-slate-900">Course</a><span className="mx-2">/</span><span>{copy.title}</span></nav>
            <header className="mb-8">
                <p className="mb-2 text-sm font-medium text-slate-500">Capstone</p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{copy.title}</h1>
                <p className="mt-2 max-w-2xl text-slate-600">{copy.description}</p>
            </header>
            {state === "pending" && <section aria-busy="true" className="grid gap-4 md:grid-cols-2"><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /></section>}
            {state === "error" && <section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"><p>{copy.error}</p><button className="mt-4 rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white" onClick={load}>{copy.retry}</button></section>}
            {state === "empty" && <section className="rounded-xl border border-dashed border-slate-300 p-10 text-center"><h2 className="font-semibold text-slate-900">{copy.empty}</h2><p className="mt-2 text-sm text-slate-600">{copy.emptyDescription}</p></section>}
            {state === "ready" && <>
                <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-4"><h2 className="font-semibold text-slate-950">{copy.progress}</h2><span className="text-sm font-medium text-slate-600">{progress.completionPercent}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${progress.completionPercent}%` }} /></div><p className="mt-3 text-sm text-slate-500">{progress.tasksCompleted}/{progress.tasksTotal} tasks completed</p></section>
                <div className="space-y-6">{milestones.map((milestone) => <section key={milestone.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-950">{milestone.title}</h2><span className="text-sm text-slate-500">{milestone.tasks.filter((task) => task.completed).length}/{milestone.tasks.length}</span></div><div className="grid gap-3 sm:grid-cols-2">{milestone.tasks.map((task) => <button key={task.id} onClick={() => openTask(task.id)} className="flex min-h-20 items-center justify-between rounded-lg border border-slate-200 p-4 text-left transition hover:border-slate-400 hover:bg-slate-50"><span><span className="block font-medium text-slate-900">{task.title}</span><span className="mt-1 block text-sm text-slate-500">{taskState(task, currentId)}</span></span><span aria-hidden className="text-slate-400">→</span></button>)}</div></section>)}</div>
            </>}
        </main>
    )
}
