import { Tree } from "@/components/branches/Tree"
import { Heading } from "@/components/leaves/Heading"
import {
    defineContractComponent,
    defineLeafComponent,
    type ContractComponent,
    type LeafComponent,
} from "@/components/contracts/props"

const heading = defineLeafComponent("heading", {}, () => <Heading props={{ content: "Title", level: 2 }} />)
const title = defineContractComponent("title-with-end-action", { title: heading })
const smallText = defineLeafComponent("text", { size: "sm" }, () => null)

const acceptsTitle: ContractComponent<"title-with-end-action"> = title
const acceptsText: LeafComponent<"text", { readonly size: "sm" }> = smallText

export const contractTypeProof = () => (
    <>
        <Tree contract="title-with-end-action" render={acceptsTitle} />
        {/* @ts-expect-error A render function branded for another contract cannot cross this slot. */}
        <Tree contract="title-with-baseline-fact" render={acceptsTitle} />
        {/* @ts-expect-error A bare inline callback carries no contract metadata. */}
        <Tree contract="title-with-end-action" render={() => null} />
    </>
)

// @ts-expect-error Leaf identity is nominal even when the constrained literals are identical.
const wrongLeafName: LeafComponent<"heading", { readonly size: "sm" }> = acceptsText
void wrongLeafName

// @ts-expect-error The contract requires the literal size "sm", not merely a text leaf.
defineContractComponent("centred-title-pair", { title: heading, description: defineLeafComponent("text", {}, () => null) })
