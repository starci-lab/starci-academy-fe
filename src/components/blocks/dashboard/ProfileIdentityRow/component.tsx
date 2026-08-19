import { ProfileRow } from "@/components/composites/ProfileRow"

/** Settled states accepted by the pure dashboard identity anchor. */
export type ProfileIdentityRowProps =
    | { readonly state: "empty" }
    | { readonly state: "pending" }
    | {
        readonly state: "settled"
        readonly props: {
            readonly displayName: string
            readonly username: string
            readonly avatar?: string
        }
        readonly on: { readonly openProfile: () => void }
    }

/** Pure identity anchor; request and route ownership stay in the connected half. */
export const ProfileIdentityRowBase = (input: ProfileIdentityRowProps) => {
    if (input.state === "empty") return null
    if (input.state === "pending") {
        return <ProfileRow props={{}} isLoading />
    }
    return (
        <ProfileRow
            props={input.props}
            on={{ press: input.on.openProfile }}
        />
    )
}

/** Source-level tier marker for the pure dashboard identity block. */
export const meta = { world: "pure", domain: "identity" } as const
