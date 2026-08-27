import { ProfilePublicCvBlock } from "@/components/blocks/profile/ProfilePublicCv"

/** Page shell; the connected CV block owns query state, data and actions. */
export type ProfilePublicCvPageProps = Record<never, never>
/** Render the profile CV block. */
export const ProfilePublicCvPageBase = (props: ProfilePublicCvPageProps) => { void props; return <ProfilePublicCvBlock /> }
