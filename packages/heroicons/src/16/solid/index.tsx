import { forwardRef, type ReactNode, type SVGProps } from "react"

export * from "@heroicons/react/16/solid"

/** Props shared by StarCi micro cuts that follow Heroicons' accessible SVG surface. */
export type StarCiSolidIconProps = SVGProps<SVGSVGElement> & {
    readonly title?: string
    readonly titleId?: string
}

/** Build one fixed 16px solid cut while preserving Heroicons-compatible SVG props. */
const solidIcon = (name: string, body: ReactNode) => {
    const Component = forwardRef<SVGSVGElement, StarCiSolidIconProps>((input, ref) => {
        const { title, titleId, ...props } = input
        return (
            <svg
                ref={ref}
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden={title === undefined ? "true" : undefined}
                aria-labelledby={title === undefined ? undefined : titleId}
                data-slot="icon"
            >
                {title === undefined ? null : <title id={titleId}>{title}</title>}
                {body}
            </svg>
        )
    })
    Component.displayName = name
    return Component
}

/** Solid micro cut for the persistent two-pane course rail. */
export const CourseRailIcon = solidIcon("CourseRailIcon", (
    <path fillRule="evenodd" clipRule="evenodd" d="M2.75 2A1.75 1.75 0 0 0 1 3.75v8.5C1 13.216 1.784 14 2.75 14h10.5A1.75 1.75 0 0 0 15 12.25v-8.5A1.75 1.75 0 0 0 13.25 2H2.75ZM2.5 3.75c0-.138.112-.25.25-.25H6v9H2.75a.25.25 0 0 1-.25-.25v-8.5Zm5 8.75v-9h5.75c.138 0 .25.112.25.25v8.5a.25.25 0 0 1-.25.25H7.5Z" />
))

/** Solid micro cut for a central thought and its connected branches. */
export const MindMapIcon = solidIcon("MindMapIcon", (
    <>
        <path d="M7.25 6.25h1.5a1 1 0 0 1 1 1v1.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1.5a1 1 0 0 1 1-1Z" />
        <path d="M2 1.5h3v2H2v-2Zm9 0h3v2h-3v-2ZM2 12.5h3v2H2v-2Zm9 0h3v2h-3v-2ZM7.5 3.5h1v2.75h-1V3.5Zm0 6.25h1v2.75h-1V9.75ZM5 2h6v1H5V2Zm0 11h6v1H5v-1ZM3.5 3.5h1v9h-1v-9Zm8 0h1v9h-1v-9Z" />
    </>
))

/** Solid micro cut for a live interview microphone. */
export const MockInterviewIcon = solidIcon("MockInterviewIcon", (
    <path d="M7 1.5a2 2 0 0 1 4 0v4a2 2 0 1 1-4 0v-4ZM4.75 5a.75.75 0 0 1 .75.75 3.5 3.5 0 1 0 7 0 .75.75 0 0 1 1.5 0 5.002 5.002 0 0 1-4.25 4.944V13h1.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5h1.5v-2.306A5.002 5.002 0 0 1 4 5.75.75.75 0 0 1 4.75 5Z" />
))

/** Solid micro cut for stacked conceptual foundations. */
export const FoundationsIcon = solidIcon("FoundationsIcon", (
    <>
        <path d="M7.515 1.12a1 1 0 0 1 .97 0l6 3.333a.75.75 0 0 1 0 1.312l-6 3.333a1 1 0 0 1-.97 0l-6-3.333a.75.75 0 0 1 0-1.312l6-3.333Z" />
        <path d="m1.918 8.327 5.597 3.11a1 1 0 0 0 .97 0l5.597-3.11.403.224a.75.75 0 0 1 0 1.311l-6 3.334a1 1 0 0 1-.97 0l-6-3.334a.75.75 0 0 1 0-1.311l.403-.224Z" />
    </>
))

/** Solid micro cut for a bounded terminal playground. */
export const PlaygroundIcon = solidIcon("PlaygroundIcon", (
    <>
        <path fillRule="evenodd" clipRule="evenodd" d="M2.75 2A1.75 1.75 0 0 0 1 3.75v8.5C1 13.216 1.784 14 2.75 14h10.5A1.75 1.75 0 0 0 15 12.25v-8.5A1.75 1.75 0 0 0 13.25 2H2.75Zm-.25 1.75c0-.138.112-.25.25-.25h10.5c.138 0 .25.112.25.25v8.5a.25.25 0 0 1-.25.25H2.75a.25.25 0 0 1-.25-.25v-8.5Z" />
        <path d="M4.47 6.22a.75.75 0 0 1 1.06 0l1.25 1.25a.75.75 0 0 1 0 1.06L5.53 9.78a.75.75 0 0 1-1.06-1.06L5.19 8l-.72-.72a.75.75 0 0 1 0-1.06ZM8.25 9.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" />
    </>
))
