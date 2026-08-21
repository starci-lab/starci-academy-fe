import { forwardRef, type ReactNode, type SVGProps } from "react"

export * from "@heroicons/react/24/outline"

/** Props shared by StarCi cuts that follow Heroicons' accessible SVG surface. */
export type StarCiOutlineIconProps = SVGProps<SVGSVGElement> & {
    readonly title?: string
    readonly titleId?: string
}

/** Build one fixed 24px outline cut while preserving Heroicons-compatible SVG props. */
const outlineIcon = (name: string, body: ReactNode) => {
    const Component = forwardRef<SVGSVGElement, StarCiOutlineIconProps>((input, ref) => {
        const { title, titleId, ...props } = input
        return (
            <svg
                ref={ref}
                {...props}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
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

/** Two persistent panes separated by the boundary controlled by the course-rail toggle. */
export const CourseRailIcon = outlineIcon("CourseRailIcon", (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h15A1.5 1.5 0 0 1 21 6v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15" />
    </>
))

/** A central thought connected to four independently addressable branches. */
export const MindMapIcon = outlineIcon("MindMapIcon", (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75V7.5m0 6.75v2.25M9.75 12H7.5m6.75 0h2.25M12 7.5 7.5 5.25M12 7.5l4.5-2.25M12 16.5l-4.5 2.25M12 16.5l4.5 2.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 10.5A.75.75 0 0 1 10.5 9.75h3a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75v-3ZM5.25 3.75h4.5v3h-4.5v-3Zm9 0h4.5v3h-4.5v-3Zm-9 13.5h4.5v3h-4.5v-3Zm9 0h4.5v3h-4.5v-3Z" />
    </>
))

/** A live interview microphone paired with the prompt notes the learner answers. */
export const MockInterviewIcon = outlineIcon("MockInterviewIcon", (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5a2.25 2.25 0 0 1 4.5 0v5.25a2.25 2.25 0 0 1-4.5 0V4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9.75a5.25 5.25 0 0 0 10.5 0M13.5 15v4.5m-2.25 0h4.5M4.5 6h3m-3 3h2.25m-2.25 3h3" />
    </>
))

/** Stacked conceptual layers that build durable foundations before applied work. */
export const FoundationsIcon = outlineIcon("FoundationsIcon", (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 8.25 4.5L12 12 3.75 7.5 12 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 12 8.25 4.5 8.25-4.5M3.75 16.5 12 21l8.25-4.5" />
    </>
))

/** A bounded terminal prompt for an executable, disposable learning environment. */
export const PlaygroundIcon = outlineIcon("PlaygroundIcon", (
    <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h15A1.5 1.5 0 0 1 21 6v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m7.5 9 2.25 2.25L7.5 13.5m4.5 0h4.5" />
    </>
))
