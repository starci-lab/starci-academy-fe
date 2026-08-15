declare module "react-rating-stars-component" {
    import type { ComponentType, ReactElement } from "react"

    /** Public props used by the package's read-only rating surface. */
    export type ReactStarsProps = {
        readonly a11y?: boolean
        readonly activeColor?: string
        readonly classNames?: string
        readonly color?: string
        readonly count?: number
        readonly edit?: boolean
        readonly emptyIcon?: ReactElement
        readonly filledIcon?: ReactElement
        readonly halfIcon?: ReactElement
        readonly isHalf?: boolean
        readonly onChange?: (rating: number) => void
        readonly size?: number
        readonly value?: number
    }

    const ReactStars: ComponentType<ReactStarsProps>
    export default ReactStars
}
