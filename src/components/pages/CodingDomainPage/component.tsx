import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection, defineLeafComponent } from "@/components/contracts/props"
import { CodingDomainStanding } from "@/components/blocks/coding/CodingDomainStanding"
import { CodingProblemList } from "@/components/blocks/coding/CodingProblemList"

/** Route identity and shell copy for one coding domain. */
export type CodingDomainPageProps = {
    readonly domain: string
    readonly navHome: string
    readonly navPractice: string
    readonly title: string
    readonly on?: { readonly goHome?: () => void; readonly goPractice?: () => void }
}

/** Keep topic anatomy in the page and compose connected standing and problem blocks directly. */
export const CodingDomainPageBase = (input: CodingDomainPageProps) => <Tree contract="coding-domain-page" render={defineContractComponent("coding-domain-page", {
    header: defineContractComponent("page-header-stack", {
        trail: defineLeafComponent("breadcrumbs", {}, () => <Breadcrumbs props={{ label: input.title, steps: [{ id: "home", label: input.navHome }, { id: "practice", label: input.navPractice }, { id: "domain", label: input.title }] }} on={{ home: input.on?.goHome, practice: input.on?.goPractice }} />),
        title: defineLeafComponent("heading", {}, () => <Heading props={{ content: input.title, level: 1 }} />),
    }),
    standing: defineContractProjection("label-fact-over-progress", () => <CodingDomainStanding domain={input.domain} />),
    problems: defineContractProjection("coding-domain-problem-region", () => <CodingProblemList domain={input.domain} />),
})} />

/** Source-level ownership marker for the pure topic page shell. */
export const meta = { world: "pure", domain: "coding" } as const
