import { useMemo, useRef } from "react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import type { LeafProps } from "@/components/contracts/props"

/**
 * LEAF - `CodeEditor`: the surface a solution is written on.
 *
 * Target path: `src/components/leaves/CodeEditor/index.tsx`.
 *
 * IT IS NOT `CodeBlock`. That leaf displays code and owns no input, no selection and no key
 * handling; making it editable would put two very different components behind one name.
 *
 * IT COUNTS BEHAVIOUR, AND THAT IS PART OF THE PRODUCT rather than an analytics afterthought. The
 * submit mutation accepts `pasteCount`, `pasteSizeMax`, `keystrokeCount` and `tabBlurCount`, and
 * those are what the server scores an attempt's honesty with. Only the surface the typing happens
 * on can see them, so they are counted here and reported upward as one settled reading rather than
 * as a stream of events for a block to re-derive.
 *
 * THE COUNTERS LIVE IN A REF, NOT IN STATE. A keystroke that re-rendered the editor would repaint
 * the code under the hands of the person typing it, which is the one thing this component must
 * never do. The same reasoning keeps the document UNCONTROLLED: `defaultValue` is the starting
 * text and the editor owns its buffer afterwards.
 *
 * FIVE LANGUAGES, BECAUSE THE SERVER ACCEPTS FIVE. `CodingLanguage` is `python | javascript |
 * typescript | java | cpp`, and each maps to its own CodeMirror grammar - TypeScript being
 * JavaScript's grammar with one flag rather than a package of its own. A language outside the five
 * cannot be submitted, so it falls back to plain text rather than pretending to highlight it.
 */

/** What the server is told about how the code arrived. */
export type EditorTelemetry = {
    /** How many paste events landed in the box. */
    readonly pasteCount: number
    /** The largest single paste, in characters. */
    readonly pasteSizeMax: number
    /** How many keystrokes were recorded. */
    readonly keystrokeCount: number
    /** How many times the box lost focus. */
    readonly tabBlurCount: number
}

/** What this leaf draws. A `type`, not an `interface` - only an alias satisfies the data fence. */
export type CodeEditorData = {
    /** The id its label points at. */
    readonly id: string
    /** Which of the five languages the code is in. */
    readonly language: string
    /** The starting source. Uncontrolled: the box owns its own buffer after this. */
    readonly defaultValue?: string
    /** The already-resolved accessible name. */
    readonly label: string
    /** Whether the box refuses input, because a submission is in flight. */
    readonly readOnly?: boolean
}

/** What writing in it reports. */
export type CodeEditorActions = {
    /** Called with the current source on every change. */
    readonly change?: (code: string) => void
    /** Called with the settled counters whenever one of them moves. */
    readonly telemetry?: (reading: EditorTelemetry) => void
}

/** Props for {@link CodeEditor}. Three fixed slots, no fourth - see {@link LeafProps}. */
export type CodeEditorProps = LeafProps<CodeEditorData, CodeEditorActions>

/** The editor fills whatever height the column left it. */
const HOST_CLASSES = "h-full min-h-64 w-full overflow-auto"

/**
 * Draw the editor.
 *
 * @param input - {@link CodeEditorProps}
 */
export const CodeEditor = ({ props, on }: CodeEditorProps) => {
    // A MUTABLE tally behind a readonly REPORT. `EditorTelemetry` is the settled reading handed
    // upward and is readonly for the reason every data type here is - a caller must not edit what
    // it was told. The running tally underneath it is a different thing and has to be writable.
    const counters = useRef<{ -readonly [K in keyof EditorTelemetry]: EditorTelemetry[K] }>({
        pasteCount: 0,
        pasteSizeMax: 0,
        keystrokeCount: 0,
        tabBlurCount: 0,
    })

    const extensions = useMemo(() => {
        /** Publish the settled counters. Called after one moves, never on a timer. */
        const report = () => on?.telemetry?.({ ...counters.current })

        const grammar = props.language === "python"
            ? [python()]
            : props.language === "java"
                ? [java()]
                : props.language === "cpp"
                    ? [cpp()]
                    : props.language === "typescript"
                        ? [javascript({ typescript: true })]
                        : props.language === "javascript"
                            ? [javascript()]
                            : []

        return [
            ...grammar,
            EditorView.lineWrapping,
            // The vendor's own DOM seam, so the counters see the same events the document does
            // rather than a React synthetic layer above it.
            EditorView.domEventHandlers({
                paste: (event) => {
                    const pasted = event.clipboardData?.getData("text") ?? ""
                    counters.current.pasteCount += 1
                    counters.current.pasteSizeMax = Math.max(
                        counters.current.pasteSizeMax,
                        pasted.length,
                    )
                    report()
                    return false
                },
                keydown: () => {
                    counters.current.keystrokeCount += 1
                    report()
                    return false
                },
                blur: () => {
                    counters.current.tabBlurCount += 1
                    report()
                    return false
                },
            }),
        ]
    }, [props.language, on])

    return (
        <div
            data-tier="leaf"
            data-component="CodeEditor"
            data-language={props.language}
            className={HOST_CLASSES}
        >
            <CodeMirror
                id={props.id}
                aria-label={props.label}
                value={props.defaultValue}
                theme={vscodeDark}
                editable={props.readOnly !== true}
                extensions={extensions}
                height="100%"
                onChange={(code) => on?.change?.(code)}
            />
        </div>
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "leaf", world: "pure" } as const
