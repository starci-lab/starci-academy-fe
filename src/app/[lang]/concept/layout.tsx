import type { ReactNode } from "react"
import { ShellNav } from "@/components/product-shells/ShellNav"

type ConceptLayoutProps = { readonly children: ReactNode }

/** Keep Academy navigation mounted across the standalone concept catalog and reader. */
const ConceptLayout = ({ children }: ConceptLayoutProps) => <><ShellNav {...{}} />{children}</>

export default ConceptLayout
