import { Tree } from "@/components/branches/Tree"
import { PressableTree } from "@/components/branches/PressableTree"
import { Badge } from "@/components/leaves/Badge"
import { Text } from "@/components/leaves/Text"
import { defineContractComponent, defineLeafComponent, type CompositeProps } from "@/components/contracts/props"

/** Resolved showcase facts for one pinned project. */
export type ProfileProjectCardData = {
    readonly title?: string
    readonly description?: string
    readonly kind?: string
    readonly technologies: ReadonlyArray<string>
    readonly verified?: boolean
}

/** Optional external-project outcome reported by a pressable showcase. */
export type ProfileProjectCardActions = { readonly press?: () => void }
/** Closed composite input for one project showcase tile. */
export type ProfileProjectCardProps = CompositeProps<ProfileProjectCardData, ProfileProjectCardActions>

/** One pinned-project tile; unlike a proof row, its tags and verification form a bounded showcase. */
export const ProfileProjectCard = ({ props, on, isLoading = false }: ProfileProjectCardProps) => {
    const content = defineContractComponent("profile-project-card", {
        badge: defineLeafComponent("badge", {}, () => (
            <Badge props={{ content: props.verified ? "Verified by StarCi" : props.kind ?? "External", tone: props.verified ? "success" : "neutral" }} isLoading={isLoading} />
        )),
        title: defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
            <Text props={{ content: props.title, size: "sm", weight: "semibold" }} isLoading={isLoading} />
        )),
        ...(props.description === undefined ? {} : {
            description: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                <Text props={{ content: props.description, size: "xs" }} isLoading={isLoading} />
            )),
        }),
        ...(props.technologies.length === 0 ? {} : {
            tech: defineContractComponent("profile-project-tech-run", {
                tech: props.technologies.map((technology) => defineLeafComponent("badge", {}, () => (
                    <Badge props={{ content: technology }} isLoading={isLoading} />
                ))),
            }),
        }),
    })
    return on?.press === undefined
        ? <Tree contract="profile-project-card" render={content} />
        : <PressableTree contract="profile-project-card" render={content} label={props.title ?? "Project"} press={on.press} />
}

/** Source-level tier marker. */
export const meta = { shape: "composite", world: "pure" } as const
