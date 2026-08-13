"use client"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineLeafComponent } from "@/components/contracts/props"
import { _CourseDetailPage } from "@/components/pages/CourseDetailPage/component"
import type { RenderedState } from "~candidate/states"

/**
 * Review chrome, not candidate source: nothing here is ported.
 *
 * It is a client boundary for the reason the target has one in the same place - every StarCi leaf
 * reaches HeroUI, which reaches `client-only`. Production crosses that boundary in its routed page;
 * the candidate crosses it here, one step further out, because the enumerating route above must stay
 * a server component to emit one static file per state.
 *
 * EVERYTHING IT DRAWS IS NOW THE REAL THING. Revision 1.4 removed the candidate's `Tree` shim: the
 * seventeen entries live in the locked registry, so `ContractKey` admits them and this imports the
 * production branch, the production registry and the production page. What the lab shows is
 * therefore the code that shipped, not a copy of it - and the checking behind it is production's,
 * which is what the shim was quietly missing.
 */

/** Props for {@link RenderState}. */
export interface RenderStateProps {
    /** The state to draw. */
    readonly state: RenderedState
}

/**
 * Draw one state inside the document's one main landmark.
 *
 * @param input - {@link RenderStateProps}
 */
export const RenderState = (input: RenderStateProps) => (
    <Tree
        contract="routed-page-main"
        render={defineContractComponent("routed-page-main", {
            page: defineLeafComponent("page", {}, () => <_CourseDetailPage {...input.state.props} />),
        })}
    />
)
