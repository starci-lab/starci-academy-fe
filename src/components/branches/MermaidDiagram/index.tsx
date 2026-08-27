"use client"

import { useEffect, useId, useState } from "react"
import mermaid from "mermaid"
import {
    mermaidCaptionClassName,
    mermaidCloseClassName,
    mermaidDialogClassName,
    mermaidExpandedCaptionClassName,
    mermaidExpandedSvgClassName,
    mermaidExpandedViewportClassName,
    mermaidFailureClassName,
    mermaidFigureClassName,
    mermaidHeaderClassName,
    mermaidLanguageClassName,
    mermaidLoadingClassName,
    mermaidSvgViewportClassName,
} from "./classNames"

/** Authored Mermaid source and its accessible figure label. */
export type MermaidDiagramData = {
    readonly source: string
    readonly label?: string
    readonly caption?: string
    readonly expandLabel?: string
}

/** Props for the rendered Mermaid figure. */
export type MermaidDiagramProps = { readonly props: MermaidDiagramData }

/** Render one Mermaid fence as the SVG diagram legacy content already promised. */
export const MermaidDiagram = (props: MermaidDiagramProps) => {
    const renderId = useId().replace(/[^a-zA-Z0-9_-]/g, "")
    const [svg, setSvg] = useState<string>()
    const [failed, setFailed] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        let active = true
        mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: "neutral" })
        void mermaid.render(`starci-mermaid-${renderId}`, props.props.source)
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
    }, [props.props.source, renderId])

    if (failed) {
        return <pre data-failed="true" className={mermaidFailureClassName}>{props.props.source}</pre>
    }
    return (
        <>
            <figure aria-label={props.props.label ?? "Mermaid diagram"} className={mermaidFigureClassName}>
                <div className={mermaidHeaderClassName}>
                    <span className={mermaidLanguageClassName}>mermaid</span>
                    {svg === undefined ? null : <button type="button" className={mermaidLanguageClassName} aria-label={props.props.expandLabel ?? "Expand diagram"} onClick={() => setOpen(true)}>Expand</button>}
                </div>
                {svg === undefined
                    ? <span className={mermaidLoadingClassName} />
                    : <div className={mermaidSvgViewportClassName} dangerouslySetInnerHTML={{ __html: svg }} />}
                {props.props.caption === undefined ? null : <figcaption className={mermaidCaptionClassName}>{props.props.caption}</figcaption>}
            </figure>
            {open && svg !== undefined ? (
                <div role="dialog" aria-modal="true" aria-label={props.props.caption ?? props.props.label ?? "Mermaid diagram"} className={mermaidDialogClassName}>
                    <button type="button" className={mermaidCloseClassName} onClick={() => setOpen(false)}>Close</button>
                    <div className={mermaidExpandedViewportClassName}>
                        <div className={mermaidExpandedSvgClassName} dangerouslySetInnerHTML={{ __html: svg }} />
                    </div>
                    <p className={mermaidExpandedCaptionClassName}>{props.props.caption ?? props.props.label ?? "Figure"}</p>
                </div>
            ) : null}
        </>
    )
}
