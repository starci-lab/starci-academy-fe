import Image from "next/image"
import { getStarCiAiTeacherClassName, starCiAiTeacherClassNames } from "./classNames"

/** Supported teacher-avatar measures across messages, headers and empty states. */
export type StarCiAiTeacherSize = "sm" | "md" | "hero"

/** Resolved accessible identity and presence state for the AI teacher. */
export type StarCiAiTeacherData = {
    readonly alt?: string
    readonly size?: StarCiAiTeacherSize
    readonly isOnline?: boolean
}

/** Props for the circular StarCi AI teacher character. */
export type StarCiAiTeacherProps = { readonly props: StarCiAiTeacherData; readonly isLoading?: boolean }

/** Draw the AI teacher as a consistently circular character avatar. */
export const StarCiAiTeacher = (props: StarCiAiTeacherProps) => {
    const size = props.props.size ?? "md"
    const pixels = size === "hero" ? 112 : size === "md" ? 44 : 32
    return (
        <span className={getStarCiAiTeacherClassName(size, props.isLoading)} data-slot="starci-ai-teacher" data-loading={props.isLoading === true ? "true" : "false"}>
            {props.isLoading === true ? null : <Image
                src="/brand/starci-ai-teacher-v1.png"
                alt={props.props.alt ?? ""}
                width={pixels}
                height={pixels}
                className={starCiAiTeacherClassNames.image}
            />}
            {props.isLoading === true || props.props.isOnline !== true ? null : <span className={starCiAiTeacherClassNames.status} aria-hidden="true" />}
        </span>
    )
}
