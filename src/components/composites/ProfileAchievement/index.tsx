import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/** One earned achievement name and rarity fact. */
export type ProfileAchievementData = { readonly name?: string, readonly rarity?: string }
/** Settled input for one achievement tile. */
export type ProfileAchievementProps = CompositeProps<ProfileAchievementData>

/** Draw one earned-proof tile. */
export const ProfileAchievement = ({ props, isLoading = false }: ProfileAchievementProps) => (
    <SurfaceCard contract="profile-achievement-card" render={defineContractComponent("profile-achievement-card", {
        mark: defineLeafComponent("icon-tile", {}, () => <IconTile props={{ icon: "reward", tone: "accent", size: "md" }} isLoading={isLoading} />),
        name: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => <Text props={{ content: props.name, size: "sm", weight: "semibold" }} isLoading={isLoading} />),
        rarity: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => <Text props={{ content: props.rarity, size: "xs", tone: "muted" }} isLoading={isLoading} />),
    })} />
)

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
