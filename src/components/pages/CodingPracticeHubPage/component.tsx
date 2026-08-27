import { Breadcrumbs } from "@/components/leaves/Breadcrumbs"
import { Heading } from "@/components/leaves/Heading"
import { DomainMasteryGrid } from "@/components/blocks/coding/DomainMasteryGrid"

/** Page-owned words and route-level navigation for the practice hub shell. */
export type CodingPracticeHubPageProps = {
    readonly navHome: string
    readonly navPractice: string
    readonly title: string
    readonly on?: { readonly goHome?: () => void }
}

/** Keep the route anatomy here and let the connected domain block own its data and states. */
export const CodingPracticeHubPageBase = (props: CodingPracticeHubPageProps) => <>
    <Breadcrumbs props={{ label: props.title, steps: [{ id: "home", label: props.navHome }, { id: "practice", label: props.navPractice }] }} on={{ home: props.on?.goHome }} />
    <Heading props={{ content: props.title, level: 1 }} />
    <DomainMasteryGrid />
</>
