import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"

/** One earned achievement name and rarity fact. */
export type ProfileAchievementData = { readonly name?: string, readonly rarity?: string }
/** Settled input for one achievement tile. */
export type ProfileAchievementProps = { readonly props: ProfileAchievementData; readonly isLoading?: boolean }

/** Draw one earned-proof tile. */
export const ProfileAchievement = (props: ProfileAchievementProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return <SurfaceCard><IconTile props={{ icon: "reward", tone: "accent", size: "md" }} isLoading={isLoading} /><Text props={{ content: data.name, size: "sm", weight: "semibold" }} isLoading={isLoading} /><Text props={{ content: data.rarity, size: "xs", tone: "muted" }} isLoading={isLoading} /></SurfaceCard>
}
