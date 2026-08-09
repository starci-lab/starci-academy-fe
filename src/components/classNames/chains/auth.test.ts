import { describe, expect, it } from "vitest"
import {
    SIGN_IN_COMPOSITION_CHAIN_NAMES,
    type SignInCompositionChain,
} from "@/components/classNames/chains/auth"
import { SignInFlow } from "@/components/overlays/auth/SignInFlow"
import { _SignInFlow } from "@/components/overlays/auth/SignInFlow/component"
import { _SignInOverlay } from "@/components/overlays/auth/SignInOverlay/component"
import { signInOverlayChain } from "@/components/overlays/auth/SignInOverlay"
import { _AuthenticationPage } from "@/components/pages/AuthenticationPage/component"
import { signInPageChain } from "@/components/pages/AuthenticationPage"

/**
 * What these tests guard: that the two sign-in surfaces are pinned to the components they are
 * really made of, and that the pin refuses the substitutions that would actually break.
 *
 * The last test in this file records what the pin does NOT catch. That is deliberate: level A
 * derives its constraint from a real signature, so a component asking for strictly LESS still
 * satisfies it. Writing that down as a passing test is more honest than implying a guarantee
 * the type system is not making - and it is the line an author must revisit if the surfaces
 * ever stop being interchangeable in that direction.
 *
 * A twin test is allowed the value imports the rest of this folder is not - see
 * `starci-fe/classnames-type-imports-only`, which exempts twins for exactly this reason.
 */

/** Accepts a well-formed entry and nothing else - the one place a wrong pairing is offered. */
const asSignInChain = (entry: SignInCompositionChain): SignInCompositionChain => entry

describe("SIGN_IN_COMPOSITION_CHAIN_NAMES", () => {
    it("lists the two sign-in compositions that exist", () => {
        expect([...SIGN_IN_COMPOSITION_CHAIN_NAMES]).toEqual(["sign-in-overlay", "sign-in-page"])
    })
})

describe("the surfaces consume their chain", () => {
    it("pins the floating surface to the overlay and the connected flow", () => {
        expect(signInOverlayChain.name).toBe("sign-in-overlay")
        expect(signInOverlayChain.surface).toBe(_SignInOverlay)
        expect(signInOverlayChain.body).toBe(SignInFlow)
    })

    it("pins the routed surface to the page and the same connected flow", () => {
        expect(signInPageChain.name).toBe("sign-in-page")
        expect(signInPageChain.surface).toBe(_AuthenticationPage)
        expect(signInPageChain.body).toBe(SignInFlow)
    })

    it("hangs one flow on both surfaces rather than a copy each", () => {
        expect(signInOverlayChain.body).toBe(signInPageChain.body)
    })
})

describe("a wrong component does not compile", () => {
    it("refuses the overlay as the routed surface", () => {
        // @ts-expect-error `_SignInOverlay` asks for `isOpen` and `onDismiss`; a routed page owns no way out and never passes them.
        const rejected = asSignInChain({ name: "sign-in-page", surface: _SignInOverlay, body: SignInFlow })
        expect(rejected.name).toBe("sign-in-page")
    })

    it("refuses the presentational flow where the connected one belongs", () => {
        // @ts-expect-error `_SignInFlow` asks for a step, a status and resolved copy; the surfaces pass none of it, because the connected half resolves all of it.
        const rejected = asSignInChain({ name: "sign-in-overlay", surface: _SignInOverlay, body: _SignInFlow })
        expect(rejected.name).toBe("sign-in-overlay")
    })

    it("refuses a name that no composition carries", () => {
        // @ts-expect-error `sign-up-page` is not a composition in this repository; a chain entry names one that exists.
        const rejected = asSignInChain({ name: "sign-up-page", surface: _AuthenticationPage, body: SignInFlow })
        expect(rejected.name).toBe("sign-up-page")
    })
})

describe("the known limit of a derived constraint", () => {
    it("still accepts a surface whose props are a strict superset of what the slot needs", () => {
        // `_AuthenticationPage` asks for strictly less than the overlay does, so it satisfies
        // `ComponentType<SignInOverlayProps>` and this line compiles. Refusing it would need a
        // nominal brand, which is applied with an `as` assertion - provenance asserted rather
        // than derived, and exactly what `starci-fe/no-double-cast` exists to prevent. The gap
        // is recorded here instead of being paid for in casts.
        const accepted = asSignInChain({ name: "sign-in-overlay", surface: _AuthenticationPage, body: SignInFlow })
        expect(accepted.name).toBe("sign-in-overlay")
    })
})
