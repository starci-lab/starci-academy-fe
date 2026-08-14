"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

const CATEGORIES = [
    { id: "web", title: "Web development", description: "The building blocks behind modern web products.", count: 12 },
    { id: "devops", title: "DevOps", description: "Tools and practices for shipping with confidence.", count: 9 },
    { id: "data", title: "Data and AI", description: "Concepts that make data-driven systems useful.", count: 8 },
]

const RESOURCES = [
    { id: "http", category: "web", title: "HTTP fundamentals", kind: "Document", description: "Requests, responses and the contract between browser and server." },
    { id: "react", category: "web", title: "React rendering", kind: "Video", description: "How component trees become an interactive interface." },
    { id: "containers", category: "devops", title: "Containers", kind: "Document", description: "Package an application so it runs consistently everywhere." },
    { id: "embeddings", category: "data", title: "Embeddings", kind: "External link", description: "Represent meaning so systems can search and compare it." },
]

const copy = (isVi: boolean) => isVi ? {
    title: "Nền tảng", intro: "Những khái niệm nền tảng giúp bạn học sâu hơn.", search: "Tìm nền tảng", categories: "Danh mục", resources: "Tài nguyên", empty: "Không tìm thấy kết quả.", back: "Quay lại", open: "Mở tài nguyên",
} : { title: "Foundations", intro: "The concepts that make the rest of your learning click.", search: "Search foundations", categories: "Categories", resources: "Resources", empty: "Nothing matches that search.", back: "Back", open: "Open resource" }

export const FoundationsHub = ({ displayId, isVi }: { displayId: string, isVi: boolean }) => {
    const t = copy(isVi)
    const [query, setQuery] = useState("")
    const items = useMemo(() => CATEGORIES.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())), [query])
    return <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6">
        <header className="space-y-2"><p className="text-sm text-muted-foreground">{displayId} / learn</p><h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1><p className="text-muted-foreground">{t.intro}</p></header>
        <label className="block"><span className="sr-only">{t.search}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="h-11 w-full rounded-lg border border-default bg-content1 px-3 outline-none focus:border-primary" /></label>
        <section aria-labelledby="foundation-categories" className="space-y-3"><h2 id="foundation-categories" className="text-lg font-medium">{t.categories}</h2>{items.length === 0 ? <p className="rounded-lg border border-dashed border-default p-6 text-sm text-muted-foreground">{t.empty}</p> : <div className="grid gap-3 sm:grid-cols-2">{items.map((item) => <Link key={item.id} href={`/courses/${displayId}/learn/foundations/${item.id}`} className="rounded-xl border border-default bg-content1 p-5 transition hover:border-primary"><h3 className="font-medium">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.description}</p><p className="mt-4 text-xs text-muted-foreground">{item.count} {t.resources.toLowerCase()}</p></Link>)}</div>}</section>
    </main>
}

export const FoundationsCategory = ({ displayId, categoryId, isVi }: { displayId: string, categoryId: string, isVi: boolean }) => {
    const t = copy(isVi); const category = CATEGORIES.find((item) => item.id === categoryId); const [query, setQuery] = useState("")
    const items = RESOURCES.filter((item) => item.category === categoryId && item.title.toLowerCase().includes(query.toLowerCase()))
    return <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6"><Link href={`/courses/${displayId}/learn/foundations`} className="text-sm text-primary">← {t.back}</Link><header className="space-y-2"><h1 className="text-3xl font-semibold">{category?.title ?? t.title}</h1><p className="text-muted-foreground">{category?.description ?? t.intro}</p></header><input aria-label={t.search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} className="h-11 w-full rounded-lg border border-default bg-content1 px-3 outline-none focus:border-primary" /><section className="space-y-3"><h2 className="text-lg font-medium">{t.resources}</h2>{items.length === 0 ? <p className="rounded-lg border border-dashed border-default p-6 text-sm text-muted-foreground">{t.empty}</p> : <div className="divide-y divide-default overflow-hidden rounded-xl border border-default bg-content1">{items.map((item) => <Link key={item.id} href={`/courses/${displayId}/learn/foundations/${categoryId}/${item.id}`} className="block p-5 transition hover:bg-content2"><div className="flex items-start justify-between gap-4"><div><h3 className="font-medium">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div><span className="shrink-0 rounded-full bg-content2 px-2 py-1 text-xs text-muted-foreground">{item.kind}</span></div></Link>)}</div>}</section></main>
}

export const FoundationResource = ({ displayId, categoryId, foundationId, isVi }: { displayId: string, categoryId: string, foundationId: string, isVi: boolean }) => { const t = copy(isVi); const item = RESOURCES.find((resource) => resource.id === foundationId && resource.category === categoryId); return <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-6"><Link href={`/courses/${displayId}/learn/foundations/${categoryId}`} className="text-sm text-primary">← {t.back}</Link>{item ? <article className="space-y-6"><header className="space-y-3"><span className="text-xs uppercase tracking-wide text-muted-foreground">{item.kind}</span><h1 className="text-3xl font-semibold">{item.title}</h1><p className="text-muted-foreground">{item.description}</p></header><div className="rounded-xl border border-default bg-content1 p-6 leading-7"><p>{isVi ? "Đây là phần đọc tập trung của tài nguyên. Hãy đi theo từng ý, thử lại trong playground và quay về mind-map để nối khái niệm." : "This is the focused reading surface for the resource. Follow each idea, try it in the playground, then use the mind-map to connect the concept."}</p></div></article> : <p className="rounded-lg border border-dashed border-default p-6 text-muted-foreground">{t.empty}</p>}</main> }
