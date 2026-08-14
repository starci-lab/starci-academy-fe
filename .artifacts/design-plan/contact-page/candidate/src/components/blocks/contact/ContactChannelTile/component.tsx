import { Text } from "@/components/leaves/Text"
// The contract machinery is reached through the candidate mirror, and ONLY because `ContractKey` is
// closed over the table on disk: the entries this case proposes are not in it yet. The mirror is
// `src/components/contracts/*`, the branches this file uses and the two icon files, copied verbatim
// with their imports repointed - same signatures, same checking. On materialization these
// specifiers become `@/` and the body is unchanged.
import { PressableSurface } from "~candidate/components/branches/PressableSurface"
import {
    defineContractComponent,
    defineLeafComponent,
    type BlockProps,
} from "~candidate/components/contracts/props"
// RELATIVE, and that is a lint fact rather than a style choice. `no-vendor-icon-outside-icon-leaf`
// decides what is a glyph LIBRARY by asking whether the specifier is external, and it treats
// anything not starting with `.` or `@/` as external - so the candidate alias `~candidate/...Icon`
// reads to it as a third-party icon package while `@/components/leaves/Icon`, which the shipped
// `IconTile` writes, reads correctly. A relative specifier is the same module and the true answer.
// On materialization this becomes `@/components/leaves/Icon`; the durable fix belongs in the rule
// and is recorded in `proposed-canon-changes.md`.
import { Icon, type IconName } from "../../../leaves/Icon"

/**
 * BLOCK - `ContactChannelTile`: one way to reach the founder, and where it goes.
 *
 * Target path: `src/components/blocks/contact/ContactChannelTile/component.tsx`.
 *
 * THE HANDLE IS SHOWN, NOT IMPLIED. A tile reading only "Facebook" asks the reader to trust that it
 * points somewhere sensible; a tile reading `facebook.com/starci183` under it has already answered.
 * This is the same reason the search box prints its shortcut instead of merely binding it.
 *
 * THE CARD BELONGS TO THE BRANCH, and this file learned that from the gate. Revision 1.0 put
 * `bg-surface`, `shadow-surface` and `rounded-3xl` in the contract entry, and
 * `no-interaction-class-in-entry` refused all three with the reason: a ground and an elevation make
 * the node a raised OBJECT, and a raised object already has an owner. `PressableSurface` with
 * `isRaised` is that owner - it draws its own button, hands the node to `SurfaceCard`, and so a
 * pressable tile is the SAME card as an inert one beside it rather than a second kind of object.
 *
 * `hover: "surface"` BECAUSE NOTHING INSIDE NAMES THE DESTINATION. The branch's own comment draws
 * that line: a surface holding a line marked as the press label answers by underlining that line,
 * and one that does not must answer by dimming, because something has to answer. A channel name is
 * a service, not a link text, so this is the second case.
 *
 * THE MARK COMES FROM THE ICON LEAF. An earlier revision introduced a `BrandMark` leaf reading
 * checked-in SVGs out of `public/`, reasoning that ICON-7 admits only Heroicons - which is true, and
 * which the shipped `Icon` leaf had ALREADY answered: `leaves/Icon/brands.tsx` holds Google's and
 * GitHub's marks as local paths and `IconName` carries both. Facebook and LinkedIn are the same case
 * and belong in the same file. A second owner would have split "what mark does this product draw"
 * across two places, which is the one thing a closed icon vocabulary exists to prevent.
 *
 * IT HAS ONE STATE AND THAT IS THE POINT. Nothing here is fetched - the destinations are product
 * facts, not a payload - so this tile can never be pending, never empty and never failed. That is
 * exactly why the page puts the strip of them ABOVE the writing surface: it is the one region still
 * standing when every request on the screen has failed.
 *
 * IT IS A BUTTON RATHER THAN AN ANCHOR, because opening an external destination is the connected
 * half's decision and this half must not know a URL.
 */

/** The one situation this tile can be in. It fetches nothing, so there is no second. */
export type ContactChannelTileState = "ready"

/** What the tile draws. */
export type ContactChannelTileData = {
    /** Which mark identifies the service. */
    readonly mark: IconName
    /** The already-resolved service name. */
    readonly name: string
    /** The destination as a reader would recognise it - an address, a number, a path. */
    readonly handle: string
    /** The already-resolved accessible name for the whole tile, naming service and destination. */
    readonly label: string
}

/** Props for {@link _ContactChannelTile}. */
export type ContactChannelTileProps = BlockProps<ContactChannelTileState, ContactChannelTileData> & {
    /** Called when the reader chooses this channel. */
    readonly onOpen?: () => void
}

/**
 * Draw one channel.
 *
 * @param input - {@link ContactChannelTileProps}
 */
export const _ContactChannelTile = (input: ContactChannelTileProps) => (
    <PressableSurface
        contract="contact-channel-tile"
        label={input.props.label}
        press={input.onOpen}
        hover="surface"
        isRaised
        render={defineContractComponent("contact-channel-tile", {
            mark: defineLeafComponent("icon", {}, () => (
                <Icon props={{ name: input.props.mark, role: "heading" }} />
            )),
            // `name-over-handle` already owns "a name with the smaller thing that identifies it
            // underneath", which is exactly a service over its address. The name is plain text
            // rather than a link because the whole tile is the control - a link inside a button
            // would be two press targets for one destination.
            identity: defineContractComponent("name-over-handle", {
                name: defineLeafComponent("text", { size: "sm" }, () => (
                    <Text props={{ content: input.props.name, size: "sm", weight: "semibold" }} />
                )),
                handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                    <Text props={{ content: input.props.handle, size: "xs", tone: "muted" }} />
                )),
            }),
        })}
    />
)

/** Source-level ownership marker. */
export const meta = { world: "pure", domain: "contact" } as const
