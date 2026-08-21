import { Tree } from "@/components/branches/Tree"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import {
    defineContractComponent,
    defineContractProjection,
    type ContractComponent,
} from "@/components/contracts/props"

/** The bounded viewport whose content may scroll. */
export type ScrollViewportBoundary = "pricing-rail" | "learn-navigation-groups" | "content-map-modules" | "personal-project-milestones"

/** Props for {@link ScrollViewport}. */
type PricingRailScrollViewportProps = {
    /** Selects the approved maximum-height boundary; it does not describe the content. */
    readonly boundary: "pricing-rail"
    /** The validated pricing-rail content projected into this viewport. */
    readonly render: ContractComponent<"course-pricing-rail">
}

/** The validated navigation groups whose overflow moves independently from pinned rail controls. */
type LearnNavigationScrollViewportProps = {
    readonly boundary: "learn-navigation-groups"
    readonly render: ContractComponent<"learn-course-navigation-groups-scroll">
}

/** The course-map modules whose native thumb must not compete with the resize separator. */
type ContentMapScrollViewportProps = {
    readonly boundary: "content-map-modules"
    readonly render: ContractComponent<"content-map-module-list">
}

/** The project milestones that move without carrying project progress and search with them. */
type PersonalProjectScrollViewportProps = {
    readonly boundary: "personal-project-milestones"
    readonly render: ContractComponent<"personal-project-milestone-list-scroll">
}

/** One approved bounded region whose content, rather than its pinned siblings, owns scrolling. */
export type ScrollViewportProps = PricingRailScrollViewportProps | LearnNavigationScrollViewportProps | ContentMapScrollViewportProps | PersonalProjectScrollViewportProps

/**
 * BRANCH - `ScrollViewport`: one bounded, internally scrolling contract projection.
 *
 * HeroUI does not expose its modal scrollbar as a standalone component. Its modal body applies
 * the vendor `scrollbar` utility, which reads the active theme's `--scrollbar-width`,
 * `--scrollbar-color` and `--scrollbar-gutter`. This branch preserves that exact mechanism instead
 * of painting a parallel scrollbar or adding a fade mask.
 */
export const ScrollViewport = (input: ScrollViewportProps) => {
    if (input.boundary === "learn-navigation-groups") {
        return <Tree contract="learn-course-navigation-groups-scroll" render={input.render} />
    }
    if (input.boundary === "content-map-modules") {
        return <Tree contract="content-map-module-list" render={input.render} />
    }
    if (input.boundary === "personal-project-milestones") {
        return <Tree contract="personal-project-milestone-list-scroll" render={input.render} />
    }

    // One boundary is approved, so the viewport contract is that boundary's, named once here rather
    // than selected: a second approved boundary widens the union and this line with it.
    const viewportContract = "pricing-rail-scroll-viewport"

    return (
        <SurfaceCard
            contract={viewportContract}
            props={{ scrollInside: input.boundary }}
            render={defineContractComponent(viewportContract, {
                body: defineContractProjection("course-pricing-rail", () => (
                    <Tree contract="course-pricing-rail" render={input.render} />
                )),
            })}
        />
    )
}

/** Source-level tier marker - lets a gate read the tier without guessing from the folder path. */
export const meta = { shape: "branch", contract: "pricing-rail-scroll-viewport", world: "pure" } as const
