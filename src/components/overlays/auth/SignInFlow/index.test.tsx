import { describe, expect, it } from "vitest"
import { AuthenticationPanel } from "@/components/blocks/auth/AuthenticationPanel"
import { SignInFlow } from "./index"

/**
 * What this test guards: that the connected name is an alias too.
 *
 * The registry's chain twin asserts that both sign-in surfaces hang the SAME body. They can only
 * do that while this name and the panel are one function object; the moment a wrapper appears here
 * the two surfaces are running different components again, and nothing else in the tree would say
 * so.
 */

describe("SignInFlow", () => {
    it("is the authentication panel, not a wrapper around it", () => {
        expect(SignInFlow).toBe(AuthenticationPanel)
    })
})
