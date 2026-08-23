import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { DomainMasteryGrid } from "@/components/blocks/coding/DomainMasteryGrid"

/** Page-owned words and route-level navigation for the practice hub shell. */
export type CodingPracticeHubPageProps = {
    readonly navHome: string
    readonly navPractice: string
    readonly title: string
    readonly on?: { readonly goHome?: () => void }
}

/** Keep the route anatomy here and let the connected domain block own its data and states. */
export const CodingPracticeHubPageBase = (input: CodingPracticeHubPageProps) => <Tree contract="coding-practice-page" render={defineContractComponent("coding-practice-page", {
    header: defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ label: input.title, steps: [{ id: "home", label: input.navHome }, { id: "practice", label: input.navPractice }] }} on={{ home: input.on?.goHome }} />),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.title, level: 1 }} />),
    }),
    domains: defineContractProjection("coding-practice-domain-region", () => <DomainMasteryGrid />),
})} />

/** Source-level ownership marker for the pure page shell. */
export const meta = { world: "pure", domain: "coding" } as const
