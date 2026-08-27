import type { ReactNode } from "react"
import { Card } from "@heroui/react"
import { Heading } from "@/components/leaves/Heading"
import { formSurfaceClassName, formSurfaceContentClassName, formSurfaceFrameClassName, formSurfaceLabelClassName } from "./classNames"

/** Optional title for a form surface. */
export type SurfaceFormCardData = { readonly label?: string }
/** Traditional children API for a form surface. */
export type SurfaceFormCardProps = { readonly props?: SurfaceFormCardData; readonly children: ReactNode }

/** Draw one bounded form surface around ordinary React children. */
export const SurfaceFormCard = (props: SurfaceFormCardProps) => {
    const surface = <Card className={formSurfaceFrameClassName}><Card.Content className={formSurfaceContentClassName}>{props.children}</Card.Content></Card>
    return <div className={formSurfaceClassName}>{props.props?.label === undefined ? null : <div className={formSurfaceLabelClassName}><Heading props={{ content: props.props.label, level: 3 }} /></div>}{surface}</div>
}
