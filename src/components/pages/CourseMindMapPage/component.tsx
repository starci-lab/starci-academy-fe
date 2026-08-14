/** Query states exposed by the pure course concept map. */
export type CourseMindMapPageState = "pending" | "ready" | "empty" | "failed"

/** One normalized graph node shown in both rail and canvas. */
export type CourseMindMapNodeView = {
    readonly id: string
    readonly label: string
    readonly detail?: string
    readonly left: number
    readonly top: number
    readonly canOpen: boolean
}

/** Resolved graph data, selection and navigation actions. */
export type CourseMindMapPageProps = {
    readonly state: CourseMindMapPageState
    readonly props: {
        readonly title: string
        readonly description: string
        readonly searchLabel: string
        readonly searchPlaceholder: string
        readonly emptyText: string
        readonly noResultsText: string
        readonly failedText: string
        readonly retryLabel: string
        readonly openLabel: string
        readonly nodes: ReadonlyArray<CourseMindMapNodeView>
        readonly edgeCount: number
        readonly selectedId?: string
        readonly query: string
    }
    readonly on: {
        readonly search: (query: string) => void
        readonly select: (id: string) => void
        readonly openContent: (id: string) => void
        readonly retry: () => void
    }
}

/** Draw the server-positioned concept graph and a searchable mobile-safe rail. */
export const _CourseMindMapPage = ({ state, props, on }: CourseMindMapPageProps) => {
    const selected = props.nodes.find((node) => node.id === props.selectedId)
    return (
        <section data-tier="page" data-component="CourseMindMapPage" className="grid min-h-[calc(100dvh-4rem)] w-full @app-lg:grid-cols-[19rem_1fr]">
            <aside className="border-b border-default bg-surface p-4 @app-lg:border-b-0 @app-lg:border-r">
                <header className="flex flex-col gap-2">
                    <h1 className="text-xl font-semibold">{props.title}</h1>
                    <p className="text-sm text-muted">{props.description}</p>
                </header>
                <label className="mt-5 block text-xs font-medium text-muted">
                    {props.searchLabel}
                    <input
                        type="search"
                        value={props.query}
                        placeholder={props.searchPlaceholder}
                        className="mt-2 h-10 w-full rounded-lg border border-default bg-background px-3 text-sm outline-none focus:border-accent"
                        onChange={(event) => on.search(event.target.value)}
                    />
                </label>
                <nav aria-label={props.title} className="mt-4 flex max-h-80 flex-col gap-2 overflow-y-auto @app-lg:max-h-[calc(100dvh-15rem)]">
                    {props.nodes.map((node) => (
                        <button key={node.id} type="button" aria-current={node.id === props.selectedId ? "true" : undefined} className="rounded-lg px-3 py-3 text-left text-sm hover:bg-default-100 aria-[current=true]:bg-accent aria-[current=true]:text-accent-foreground" onClick={() => on.select(node.id)}>
                            <span className="font-medium">{node.label}</span>
                            {node.detail === undefined ? null : <span className="mt-1 block text-xs opacity-70">{node.detail}</span>}
                        </button>
                    ))}
                    {state === "ready" && props.nodes.length === 0 ? <p className="p-3 text-sm text-muted">{props.noResultsText}</p> : null}
                </nav>
            </aside>
            <div className="relative min-h-[32rem] overflow-hidden bg-background p-4 @app-sm:p-6">
                {state === "pending" ? <div className="h-full min-h-[28rem] animate-pulse rounded-xl bg-default-200" /> : state === "failed" ? (
                    <div className="mx-auto mt-12 max-w-lg rounded-xl border border-default bg-surface p-5">
                        <p className="text-sm text-danger">{props.failedText}</p>
                        <button type="button" className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" onClick={on.retry}>{props.retryLabel}</button>
                    </div>
                ) : state === "empty" ? (
                    <p className="mx-auto mt-12 max-w-lg rounded-xl border border-dashed border-default p-5 text-sm text-muted">{props.emptyText}</p>
                ) : (
                    <div className="relative min-h-[28rem] overflow-hidden rounded-xl border border-default bg-surface [background-image:radial-gradient(circle_at_1px_1px,var(--color-default-300)_1px,transparent_0)] [background-size:22px_22px]">
                        <span className="sr-only">{props.edgeCount} connections</span>
                        {props.nodes.map((node) => (
                            <button
                                key={node.id}
                                type="button"
                                aria-pressed={node.id === props.selectedId}
                                className="absolute max-w-40 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-default bg-background px-4 py-3 text-center text-sm shadow-sm transition hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent-soft"
                                style={{ left: `${node.left}%`, top: `${node.top}%` }}
                                onClick={() => on.select(node.id)}
                            >
                                {node.label}
                            </button>
                        ))}
                        {selected?.canOpen === true ? (
                            <button type="button" className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground" onClick={() => on.openContent(selected.id)}>{props.openLabel}</button>
                        ) : null}
                    </div>
                )}
            </div>
        </section>
    )
}

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "learn" } as const
