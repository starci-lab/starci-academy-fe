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
export const ProfileIdentityRowBase = (props: ProfileIdentityRowProps) => {
    if (props.state === "empty") return null
    if (props.state === "pending") {
        return <ProfileRow props={{}} isLoading />
    }
    return (
        <ProfileRow
            props={props.props}
            on={{ press: props.on.openProfile }}
        />
    )
}
