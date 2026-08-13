import type { ReactNode } from "react"
import messages from "@/messages/vi.json"
import { CandidateProviders } from "./providers"
import "./globals.css"

/**
 * The candidate root.
 *
 * Same shape as the target's root layout: a server component that resolves the locale and its
 * catalogue, then hands both to a client boundary. The contexts themselves live in
 * `providers.tsx` for the reason recorded there.
 *
 * It differs from production in exactly one way, and the design record names it: production
 * resolves the locale per request through the next-intl plugin, while the candidate pins the
 * fixture locale `vi` and imports the target's real `vi` catalogue. The copy is therefore the
 * product's own rather than invented strings — but the locale is fixed, which is why every
 * rendered state declares `locale: vi` instead of claiming locale coverage it does not have.
 */

/** Props for the candidate root layout. */
interface CandidateLayoutProps {
    /** The routed state matrix. */
    children: ReactNode
}

const CandidateLayout = ({ children }: CandidateLayoutProps) => (
    // `suppressHydrationWarning` for the same narrow reason the target uses it: the theme provider
    // writes the resolved theme onto this element before React hydrates.
    <html lang="vi" suppressHydrationWarning>
        <body>
            <CandidateProviders locale="vi" messages={messages}>
                {children}
            </CandidateProviders>
        </body>
    </html>
)

export default CandidateLayout
