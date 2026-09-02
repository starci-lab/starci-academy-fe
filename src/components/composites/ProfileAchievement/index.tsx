import { SurfaceCard } from "@starci/grammar/common"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import { profileAchievementCardClassName } from "./classNames"

/** One earned achievement name and rarity fact. */
export type ProfileAchievementData = { readonly name?: string, readonly rarity?: string }
/** Settled input for one achievement tile. */
export type ProfileAchievementProps = { readonly props: ProfileAchievementData; readonly isLoading?: boolean }

/** Draw one earned-proof tile. */
export const ProfileAchievement = (props: ProfileAchievementProps) => {
    const data = props.props
    const isLoading = props.isLoading ?? false
    return <SurfaceCard composition="joined"><div className={profileAchievementCardClassName}><IconTile source={iconSourceFor("reward", "leading")} tone={"accent"} size={"md"} isSkeleton={isLoading} /><Text size={"sm"} weight={"semibold"} isSkeleton={isLoading}>{data.name}</Text><Text size={"xs"} tone={"muted"} isSkeleton={isLoading}>{data.rarity}</Text></div></SurfaceCard>
}
