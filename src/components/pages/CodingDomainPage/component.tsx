import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
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
export const CodingDomainPageBase = (props: CodingDomainPageProps) => <>
    <Breadcrumbs props={{ label: props.title, steps: [{ id: "home", label: props.navHome }, { id: "practice", label: props.navPractice }, { id: "domain", label: props.title }] }} on={{ home: props.on?.goHome, practice: props.on?.goPractice }} />
    <Heading props={{ content: props.title, level: 1 }} />
    <CodingDomainStanding domain={props.domain} />
    <CodingProblemList domain={props.domain} />
</>
