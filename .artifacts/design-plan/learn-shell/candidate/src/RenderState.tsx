"use client"
import { Heading } from "@/components/leaves/Heading"
import { LearnShellLayoutBase } from "~candidate/components/layouts/LearnShellLayout/component"
import type { RenderedState } from "~candidate/states"

/**
 * Review chrome, not candidate source: nothing here is ported.
 *
 * It is a client boundary for the reason the target has one in the same place - every StarCi leaf
 * reaches HeroUI, which reaches `client-only`. The enumerating route above stays a server component
 * so it can emit one static file per state.
 *
 * THE SURFACE BESIDE THE SPINE IS HELD CONSTANT, and deliberately dull. This case is about the
 * frame; a different surface in each state would make every comparison a comparison of two things
 * at once, which is how a rail gets blamed for a page's spacing.
 */

/** A stand-in for whatever learn surface is routed, identical in every state. */
const Surface = () => <Heading props={{ content: "The routed surface", level: 1 }} />

/** Props for {@link RenderState}. */
export interface RenderStateProps {
    /** The state to draw. */
    readonly state: RenderedState
}

/**
 * Draw one state.
 *
 * @param input - {@link RenderStateProps}
 */
export const RenderState = (input: RenderStateProps) => (
    <LearnShellLayoutBase {...input.state.props} surface={Surface} />
)
