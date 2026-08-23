import { ProfilePublicCvBlock } from "@/components/blocks/profile/ProfilePublicCv"
import { Tree } from "@/components/branches/Tree"
import { defineContractComponent, defineContractProjection } from "@/components/contracts/props"

/** Page shell; the connected CV block owns query state, data and actions. */
export const ProfilePublicCvPageBase = () => <Tree contract="profile-main" render={defineContractComponent("profile-main", {
    section: [defineContractProjection("label-row-over-card", () => <ProfilePublicCvBlock />)],
})} />

/** Source-level tier marker. */
export const meta = { world: "pure", domain: "profile" } as const
