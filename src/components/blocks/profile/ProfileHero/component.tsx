import { Tree } from "@/components/branches/Tree"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { IconButton } from "@/components/leaves/IconButton"
import { Link } from "@/components/leaves/Link"
import { Text } from "@/components/leaves/Text"
import {
    defineContractComponent,
    defineLeafComponent,
} from "@/components/contracts/props"

/** Resolved public identity drawn by the profile rail. */
export type ProfileHeroData = {
    readonly name: string
    readonly handle: string
    readonly avatar?: string
    readonly role?: string
    readonly bio?: string
    readonly location?: string
    readonly workMode?: string
    readonly followerLabel: string
    readonly followingLabel: string
    readonly primaryLabel: string
    readonly primaryPending: boolean
    readonly shareLabel: string
    readonly githubUrl?: string
    readonly linkedinUrl?: string
    readonly websiteUrl?: string
    readonly joinedLabel: string
}

/** Product outcomes exposed by the pure profile hero. */
export type ProfileHeroActions = {
    readonly primary?: () => void
    readonly share?: () => void
}

/** State and settled data accepted by the profile hero. */
export type ProfileHeroProps = {
    readonly state: "pending" | "ready"
    readonly props: ProfileHeroData
    readonly on?: ProfileHeroActions
}

/** Draw the complete identity rail without resolving profile behavior. */
export const ProfileHeroBase = (input: ProfileHeroProps) => {
    const isLoading = input.state === "pending"
    const factValues = [input.props.location, input.props.workMode].filter((value): value is string => Boolean(value))
    const websiteUrl = input.props.websiteUrl
    const meta = [
        input.props.githubUrl === undefined ? undefined : defineLeafComponent("link", {}, () => (
            <Link props={{ label: "GitHub", externalHref: input.props.githubUrl, icon: "github" }} />
        )),
        input.props.linkedinUrl === undefined ? undefined : defineLeafComponent("link", {}, () => (
            <Link props={{ label: "LinkedIn", externalHref: input.props.linkedinUrl }} />
        )),
        websiteUrl === undefined ? undefined : defineLeafComponent("link", {}, () => (
            <Link props={{ label: websiteUrl, externalHref: websiteUrl, icon: "explore" }} />
        )),
        defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
            <Text props={{ content: input.props.joinedLabel, size: "xs" }} isLoading={isLoading} />
        )),
    ].filter((item): item is NonNullable<typeof item> => item !== undefined)

    return (
        <Tree
            contract="profile-hero-rail"
            render={defineContractComponent("profile-hero-rail", {
                avatar: defineLeafComponent("avatar", {}, () => (
                    <Avatar props={{ name: input.props.name, src: input.props.avatar, size: "lg" }} isLoading={isLoading} />
                )),
                identity: defineContractComponent("profile-name-role-stack", {
                    name: defineLeafComponent("heading", {}, () => (
                        <Heading props={{ content: input.props.name, level: 2 }} isLoading={isLoading} />
                    )),
                    handle: defineLeafComponent("text", { size: "xs", tone: "muted" }, () => (
                        <Text props={{ content: `@${input.props.handle}`, size: "xs" }} isLoading={isLoading} />
                    )),
                    ...(input.props.role === undefined ? {} : {
                        role: defineLeafComponent("text", { size: "sm" }, () => (
                            <Text props={{ content: input.props.role, size: "sm", weight: "medium" }} isLoading={isLoading} />
                        )),
                    }),
                }),
                ...(input.props.bio === undefined ? {} : {
                    bio: defineLeafComponent("text", { size: "sm", tone: "muted" }, () => (
                        <Text props={{ content: input.props.bio, size: "sm", tone: "muted" }} isLoading={isLoading} />
                    )),
                }),
                ...(factValues.length === 0 ? {} : {
                    facts: defineContractComponent("profile-fact-run", {
                        fact: factValues.map((fact) => defineLeafComponent("badge", {}, () => (
                            <Badge props={{ content: fact }} isLoading={isLoading} />
                        ))),
                    }),
                }),
                proof: defineContractComponent("profile-proof-row", {
                    fact: [input.props.followerLabel, input.props.followingLabel].map((fact) => (
                        defineLeafComponent("text", { size: "sm", weight: "semibold" }, () => (
                            <Text props={{ content: fact, size: "sm", weight: "semibold" }} isLoading={isLoading} />
                        ))
                    )),
                }),
                actions: defineContractComponent("profile-action-row", {
                    primary: defineLeafComponent("button", {}, () => (
                        <Button
                            props={{ label: input.props.primaryLabel, variant: "primary", isPending: input.props.primaryPending }}
                            on={{ press: input.on?.primary }}
                            isLoading={isLoading}
                        />
                    )),
                    share: defineLeafComponent("icon-button", {}, () => (
                        <IconButton props={{ icon: "send", label: input.props.shareLabel }} on={{ press: input.on?.share }} />
                    )),
                }),
                meta: defineContractComponent("profile-meta-list", { item: meta }),
            })}
        />
    )
}

/** Source-level marker for the pure profile block. */
export const meta = { world: "pure", domain: "profile" } as const
