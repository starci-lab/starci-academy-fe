import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror, and ONLY because `ContractKey` is
// closed over the table on disk: the entries this case proposes are not in it yet. The mirror is
// `src/components/contracts/*`, `src/components/branches/*` and the two icon files copied verbatim
// with their imports repointed - same signatures, same checking. On materialization these
// specifiers become `@/` and the bodies are unchanged.
import { PressableTree } from "~candidate/components/branches/PressableTree"
import { SurfaceListCard, type SurfaceListCardData } from "~candidate/components/branches/SurfaceListCard"
import { Tree } from "~candidate/components/branches/Tree"
import {
    defineContractComponent,
    defineContractProjection,
    defineLeafComponent,
    type BlockProps,
    type LeafProps,
} from "~candidate/components/contracts/props"
// RELATIVE, and that is a lint fact rather than a style choice. `no-vendor-icon-outside-icon-leaf`
// decides what is a glyph LIBRARY by asking whether the specifier is external, and it treats
// anything not starting with `.` or `@/` as external - so the candidate alias `~candidate/...Icon`
// reads to it as a third-party icon package while `@/components/leaves/Icon` (what the shipped
// `IconTile` writes) reads correctly. A relative specifier is the same module and the true answer.
// On materialization this becomes `@/components/leaves/Icon`; the durable fix belongs in the rule
// and is recorded in `proposed-canon-changes.md`.
import { Icon, type IconName } from "../../../leaves/Icon"

/**
 * BLOCK - `ContactChannelList`: every way to reach the founder, and where each one goes.
 *
 * Target path: `src/components/blocks/contact/ContactChannelList/component.tsx`.
 *
 * THE HANDLE IS SHOWN, NOT IMPLIED. A row reading only "Facebook" asks the reader to trust that it
 * points somewhere sensible; a row reading `facebook.com/starci183` under it has already answered.
 * This is the same reason the search box prints its shortcut instead of merely binding it.
 *
 * IT IS ONE CARD OF ROWS RATHER THAN FOUR CARDS, and the gate decided that. Revision 1.0 drew four
 * pressable tiles whose contract entry carried `bg-surface` and `shadow-surface` directly, and
 * `no-interaction-class-in-entry` refused it: a ground and an elevation make the node a raised
 * object, and a raised object already has an owner - the surface branch. `SurfaceListCard` is that
 * owner, and it happens to be the shape the legacy contact page already shipped for these exact
 * four channels.
 *
 * THE MARK COMES FROM THE ICON LEAF. An earlier revision introduced a `BrandMark` leaf reading
 * checked-in SVGs out of `public/`, reasoning that ICON-7 admits only Heroicons - which is true, and
 * which the shipped `Icon` leaf had ALREADY answered: `leaves/Icon/brands.tsx` holds Google's and
 * GitHub's marks as local paths and `IconName` carries both. Facebook and LinkedIn are the same case
 * and belong in the same file. A second owner would have split "what mark does this product draw"
 * across two places, which is the one thing a closed icon vocabulary exists to prevent.
 *
 * IT HAS ONE STATE AND THAT IS THE POINT. Nothing here is fetched - the channels are product facts,
 * not a payload - so this list can never be pending, never empty and never failed. That is exactly
 * why the page puts it ABOVE the writing surface: it is the one region still standing when every
 * request on the screen has failed.
 *
 * THE ROWS ARE BUTTONS RATHER THAN ANCHORS, because opening an external destination is the connected
 * half's decision and this half must not know a URL.
 */

/** The one situation this list can be in. It fetches nothing, so there is no second. */
export type ContactChannelListState = "ready"

/** One way to reach the founder. */
export type ContactChannel = {
    /** Stable identity, reported back when the row is pressed. */
    readonly id: string
    /** Which mark identifies the service. */
    readonly mark: IconName
    /** The already-resolved service name. */
    readonly name: string
    /** The destination as a reader would recognise it - an address, a number, a path. */
    readonly handle: string
    /** The already-resolved accessible name for the row, naming service and destination. */
    readonly label: string
}

/** What the list card draws. `label` is the card's own heading, from the surface branch. */
export type ContactChannelListData = SurfaceListCardData & {
    /** The channels, in the order they should be tried. */
    readonly channels: ReadonlyArray<ContactChannel>
}

/** What pressing a row reports. */
export type ContactChannelListActions = {
    /** Called with the channel id the reader chose. */
    readonly open?: (id: string) => void
}

/** Props for {@link _ContactChannelList}. */
export type ContactChannelListProps =
    BlockProps<ContactChannelListState, ContactChannelListData> & {
        readonly on?: ContactChannelListActions
    }

/** Turn the channels into the repeated row the list contract admits. */
const ChannelRowsView = ({ props, on }: LeafProps<ContactChannelListData, ContactChannelListActions>) => (
    <Tree
        contract="contact-channel-list"
        render={defineContractComponent("contact-channel-list", {
            channel: props.channels.map((channel) => defineContractProjection("contact-channel-row", () => (
                <PressableTree
                    contract="contact-channel-row"
                    label={channel.label}
                    press={() => on?.open?.(channel.id)}
                    render={defineContractComponent("contact-channel-row", {
                        mark: defineLeafComponent("icon", {}, () => (
                            <Icon props={{ name: channel.mark, role: "heading" }} />
                        )),
                        // `name-over-handle` already owns "a name with the smaller thing that
                        // identifies it underneath", which is exactly a service over its address.
                        identity: defineContractComponent("name-over-handle", {
                            name: defineLeafComponent("text", { size: "sm" }, () => (
                                <Text props={{ content: channel.name, size: "sm", weight: "semibold" }} />
                            )),
                            handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                                <Text props={{ content: channel.handle, size: "xs", tone: "muted" }} />
                            )),
                        }),
                        // The row leaves the page, and the trailing mark is the only thing that
                        // says so before it is pressed.
                        chevron: defineLeafComponent("icon", {}, () => (
                            <Icon props={{ name: "next", role: "chip" }} />
                        )),
                    })}
                />
            ))),
        })}
    />
)

/** Stable component type branded for the exact list contract it implements. */
const ChannelRows = defineContractComponent("contact-channel-list", ChannelRowsView)

/**
 * Draw the channels.
 *
 * @param input - {@link ContactChannelListProps}
 */
export const _ContactChannelList = (input: ContactChannelListProps) => (
    <SurfaceListCard
        contract="contact-channel-list"
        render={ChannelRows}
        props={input.props}
        on={input.on}
    />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "contact" } as const
