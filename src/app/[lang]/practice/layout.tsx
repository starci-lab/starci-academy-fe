import type { ReactNode } from "react"
import { ShellNav } from "@/components/product-shells/ShellNav"

/** Props for the practice route family layout. */
type PracticeLayoutProps = {
    readonly children: ReactNode
}

/**
 * Keep global navigation mounted across the practice route cluster.
 *
 * `/practice` is a SIBLING of `/dashboard`, not a child, so without this it inherits the bare root
 * layout: correct content, no shell, and no way out of it. That is exactly how `/courses` first
 * shipped, and this file is that lesson applied before the run rather than after it.
 *
 * The routed page opens a `main` so the landmark lets assistive technology skip the navbar instead
 * of walking every link again on each route change.
 */
const PracticeLayout = ({ children }: PracticeLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main>{children}</main>
    </>
)

export default PracticeLayout
