import type { ComponentType } from "react"
import type { IdentityStatsProps } from "@/components/blocks/dashboard/IdentityStats/component"
import type { MyCoursesProgressProps } from "@/components/blocks/dashboard/MyCoursesProgress/component"
import type { StreakStripProps } from "@/components/blocks/dashboard/StreakStrip/component"

/**
 * CHAINS - dashboard.
 *
 * A shape key constrains the SHAPE of a tree and stops there. `section` is used at seven call
 * sites with seven unrelated bodies, and nothing in `../shapes.ts` can tell them apart: the
 * `body` role only promises "a component that takes `isLoading`". A chain is the second,
 * complementary constraint - it names ONE composition that really exists on this screen and
 * pins the component type that fills it.
 *
 * STRICTNESS LEVEL A, NOT BRANDING. The slot is constrained as `ComponentType<XxxProps>`,
 * where the props type is named after the shape, so a reader - or an AI reading this file to
 * decide what goes where - sees the intended component directly in the type. The alternative,
 * a nominal brand carrying a `__shape` marker, has to be APPLIED with an `as` assertion, which
 * asserts provenance rather than deriving it; this repository has just removed every double
 * cast and added `starci-fe/no-double-cast`, and a brand would put the casts straight back.
 * A level-A constraint is derived from the component's real signature, so it cannot be
 * mislabelled: a component only satisfies it by actually having those props.
 *
 * TYPE IMPORTS ONLY. Every import above is `import type`, and `starci-fe/contracts-type-imports-only`
 * makes that mandatory inside this folder. A type import is erased at compile time, so naming a
 * block from the registry costs no runtime edge; a VALUE import here would invert the tier order
 * and create a genuine module cycle while tsc stayed perfectly green.
 *
 * NOT CAPPED. `../shapes.ts` is held to sixteen keys because a vocabulary has to stay learnable.
 * This file is held to nothing, because it is not a vocabulary: one entry per composition that
 * exists is exactly the right number, and the day a fourth dashboard region is built a fourth
 * entry is correct rather than budgeted for.
 */

/**
 * The dashboard's named body regions, each pinned to the component that fills it.
 *
 * Every entry answers the question `section` cannot: given the name of a region, WHICH
 * component belongs in it. A wrong pairing - `name="identity-stats"` with the course list -
 * is a compile error, because the two props types have nothing in common.
 */
export type DashboardSectionChain =
    /**
     * The supporting rail: streak, remaining weekly AI credit, reward balance.
     *
     * The body is `_IdentityStats` because this region's whole purpose is three glanceable
     * rows that each carry their OWN request state - a settled reward balance must not sit
     * behind a still-loading streak. `IdentityStatsProps` is the only props type in this
     * chain that takes a `rows` list of independently resting leaves, so nothing else can be
     * put here by accident.
     */
    | { name: "identity-stats"; body: ComponentType<IdentityStatsProps> }
    /**
     * The enrolled courses and how far through each one the learner is.
     *
     * The body is `_MyCoursesProgress` because this region needs a component that carries a
     * COUNT on the heading baseline and one row per course; `MyCoursesProgressProps` is the
     * only props type here with a `courses` list and a resolved count label, so a component
     * without both cannot claim the name.
     */
    | { name: "courses-progress"; body: ComponentType<MyCoursesProgressProps> }
    /**
     * The last seven days as a row of dots, beside the readout they add up to.
     *
     * The body is `_StreakStrip` because this region is fixed at seven day columns with a
     * supporting readout beside them; `StreakStripProps` is the only props type here that
     * takes a `days` list, so a component that does not model a week cannot fill it.
     */
    | { name: "streak-strip"; body: ComponentType<StreakStripProps> }

/**
 * Exhaustive over {@link DashboardSectionChain}: a member added to the union without a key
 * here stops compiling, so the runtime list below can never fall behind the type.
 */
const DASHBOARD_SECTION_CHAIN_PRESENT: Record<DashboardSectionChain["name"], true> = {
    "identity-stats": true,
    "courses-progress": true,
    "streak-strip": true,
}

/**
 * Every dashboard chain name, for gates and tests that walk the chains rather than restating
 * them. Deliberately NOT held to the shape ceiling - see the file header.
 */
export const DASHBOARD_SECTION_CHAIN_NAMES = Object.keys(
    DASHBOARD_SECTION_CHAIN_PRESENT,
) as ReadonlyArray<DashboardSectionChain["name"]>
