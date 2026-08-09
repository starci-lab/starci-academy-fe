import { describe, expect, it } from "vitest"
import { _AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel/component"
import { _SignInFlow } from "./component"

/**
 * What this test guards: that the fold is a fold and not a copy.
 *
 * The whole justification for leaving this name behind is that it holds NO implementation - the
 * registry's chain and its twin still refer to it, and an alias is the only way to satisfy them
 * without a second authentication flow existing. An identity check is therefore the only assertion
 * worth making here: the day this stops being the same function object, this folder has quietly
 * become a second implementation again, which is exactly what the fold was for.
 */

describe("_SignInFlow", () => {
    it("is the panel's presentational half, not a copy of it", () => {
        expect(_SignInFlow).toBe(_AuthenticationPanel)
    })
})
