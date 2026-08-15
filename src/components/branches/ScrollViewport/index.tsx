import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import {
    defineContractComponent,
    defineContractProjection,
    type ContractComponent,
} from "@/components/contracts/props"

/** The bounded viewport whose content may scroll. */
export type ScrollViewportBoundary = "pricing-rail"

/** Props for {@link ScrollViewport}. */
export type ScrollViewportProps = {
    /** Selects the approved maximum-height boundary; it does not describe the content. */
    readonly boundary: ScrollViewportBoundary
    /** The validated pricing-rail content projected into this viewport. */
    readonly render: ContractComponent<"course-pricing-rail">
}

/**
 * BRANCH - `ScrollViewport`: one bounded, internally scrolling contract projection.
 *
 * HeroUI does not expose its modal scrollbar as a standalone component. Its modal body applies
 * the vendor `scrollbar` utility, which reads the active theme's `--scrollbar-width`,
 * `--scrollbar-color` and `--scrollbar-gutter`. This branch preserves that exact mechanism instead
 * of painting a parallel scrollbar or adding a fade mask.
 */
export const ScrollViewport = ({
    boundary,
    render,
}: ScrollViewportProps) => {
    const viewportContract = boundary === "pricing-rail" ? "pricing-rail-scroll-viewport" : boundary

    return (
        <SurfaceCard
            contract={viewportContract}
            props={{ scrollInside: boundary }}
            render={defineContractComponent(viewportContract, {
                body: defineContractProjection("course-pricing-rail", () => (
                    <Tree contract="course-pricing-rail" render={render} />
                )),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "pricing-rail-scroll-viewport", world: "pure" } as const
