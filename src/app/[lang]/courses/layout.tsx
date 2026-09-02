import type { ReactNode } from "react"
import { ShellNav } from "@/components/product-shells/ShellNav"

/** Props for the courses route family layout. */
type CoursesLayoutProps = {
    readonly children: ReactNode
}

/**
 * Keep global navigation mounted across the courses route cluster.
 *
 * The catalog is a product surface, so it wears the product navbar for the same reason the
 * dashboard and the profile do: a reader who arrives here can still leave. Without this the route
 * rendered on the bare root layout - correct content, no shell, and no way out of it - which is
 * what the first run of the real page showed.
 *
 * The routed page opens a `main` so the landmark lets assistive technology skip the navbar instead
 * of walking every link again on each route change.
 */
const CoursesLayout = ({ children }: CoursesLayoutProps) => (
    <>
        <ShellNav {...{}} />
        <main>{children}</main>
    </>
)

export default CoursesLayout
