import type { ContractSlot } from "@/components/contracts"

/**
 * PAGE - `AuthenticationPage`, presentational half.
 *
 * The route a reader reaches when there is no application shell to summon an overlay from - a
 * bookmark, a redirect from a guarded page, a browser with the previous tab long closed. It draws
 * the same panel the overlay does, without the dialog, because a page that is already the whole
 * screen has nothing to float above.
 *
 * IT ADDS NO NODE, AND THAT IS THE DESIGN. It used to draw a `section` with a title of its own,
 * which was correct while the panel below it was only ever a sign-in form. It is not correct now:
 * the panel changes what it is called - "Sign in", "Create an account", "Reset your password" - and
 * a page title above it could only ever be one of the three, so the page would contradict its own
 * body two thirds of the time. The panel owns the title, this owns the placement, and placement on
 * a full-screen route is what the app shell's `page-shell` key already decided.
 *
 * WHAT IS LEFT, THEN, AND WHY THE FILE STILL EXISTS. The chain in
 * `src/components/contracts/chains/auth.ts` names this props type as the ROUTED surface, and the
 * one thing that makes it the routed surface is what it does NOT have: no `isOpen`, no `onDismiss`,
 * no way out to own. Keeping that as a real type is what stops the floating surface being mounted
 * here by accident.
 *
 * THE PANEL ARRIVES AS A SLOT. This half fetches nothing and knows nothing about sessions, so the
 * connected thing it renders is handed in rather than imported: the page can then be drawn in a
 * test with a stand-in and still be the page.
 */

/** What hangs on the page. Typed, so the page owns the placement rather than a body. */
export interface AuthenticationPageSlots {
    /** The authentication panel, passed uncalled so the page can rest it with the surface. */
    body: ContractSlot
}

/** Props for {@link _AuthenticationPage} - presentational; no fetch, no store, no i18n. */
export interface AuthenticationPageProps {
    /** What hangs on the page. */
    slots: AuthenticationPageSlots
    /** Renders the page in its resting state. */
    isLoading?: boolean
}

/**
 * Render the authentication page. See the file header for why it adds no node of its own.
 *
 * @param props - {@link AuthenticationPageProps}
 */
export const _AuthenticationPage = ({ slots, isLoading = false }: AuthenticationPageProps) => {
    /** The panel the caller handed in, rested with the page. */
    const Body: ContractSlot = slots.body

    return <Body isLoading={isLoading} />
}
