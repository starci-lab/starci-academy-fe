"use client"

import { useEffect, useId, useState } from "react"
import mermaid from "mermaid"
import type { LeafProps } from "@/components/contracts/props"

/** Authored Mermaid source and its accessible figure label. */
export type MermaidDiagramData = {
    readonly source: string
    readonly label?: string
    readonly caption?: string
    readonly expandLabel?: string
}

/** Props for the rendered Mermaid figure. */
export type MermaidDiagramProps = LeafProps<MermaidDiagramData>

/** Render one Mermaid fence as the SVG diagram legacy content already promised. */
export const MermaidDiagram = (input: MermaidDiagramProps) => {
    const renderId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const [svg, setSvg] = useState<string>()
    const [failed, setFailed] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        let active = true
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" })
        void mermaid.render(`starci-mermaid-${renderId}`, input.props.source)
            .then((result) => {
                if (!active) return
                setSvg(result.svg)
                setFailed(false)
            })
            .catch(() => {
                if (!active) return
                setSvg(undefined)
                setFailed(true)
            })
        return () => { active = false }
    }, [input.props.source, renderId])

    if (failed) {
        return <pre data-tier="branch" data-component="MermaidDiagram" data-failed="true" className="w-full min-w-0 overflow-x-auto rounded-xl border border-border bg-background shadow-none p-4 font-mono text-sm">{input.props.source}</pre>
    }
    return (
        <>
            <figure data-tier="branch" data-component="MermaidDiagram" aria-label={input.props.label ?? "Mermaid diagram"} className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-background shadow-none">
                <div className="flex items-center justify-between border-b border-separator px-3 py-2">
                    <span className="font-mono text-xs text-muted">mermaid</span>
                    {svg === undefined ? null : <button type="button" className="text-xs text-muted" aria-label={input.props.expandLabel ?? "Expand diagram"} onClick={() => setOpen(true)}>Expand</button>}
                </div>
                {svg === undefined
                    ? <span className="block h-48 w-full animate-pulse bg-default" />
                    : <div className="min-w-0 overflow-x-auto p-3 [&>svg]:h-auto [&>svg]:!w-auto [&>svg]:!max-w-none" dangerouslySetInnerHTML={{ __html: svg }} />}
                {input.props.caption === undefined ? null : <figcaption className="px-3 pb-3 text-center text-sm italic text-muted">{input.props.caption}</figcaption>}
            </figure>
            {open && svg !== undefined ? (
                <div role="dialog" aria-modal="true" aria-label={input.props.caption ?? input.props.label ?? "Mermaid diagram"} className="fixed inset-0 z-50 flex flex-col bg-background p-6">
                    <button type="button" className="self-end rounded-full bg-default px-3 py-2" onClick={() => setOpen(false)}>Close</button>
                    <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
                        <div className="w-full [&>svg]:h-auto [&>svg]:w-full [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
                    </div>
                    <p className="text-center text-sm italic text-muted">{input.props.caption ?? input.props.label ?? "Figure"}</p>
                </div>
            ) : null}
        </>
    )
}

/** Source-level tier marker. */
export const meta = { shape: "branch", world: "pure" } as const
