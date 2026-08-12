import type { ReactNode } from "react"
import { PublicProfileLayout } from "@/components/layouts/PublicProfileLayout"
type UsernameProfileLayoutProps = { readonly children: ReactNode }
/** Keep identity and route tabs mounted around username proof routes. */
const UsernameProfileLayout = ({ children }: UsernameProfileLayoutProps) => <PublicProfileLayout content={children} />
export default UsernameProfileLayout
