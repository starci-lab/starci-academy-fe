import type { ComponentType } from "react"
import { Tree } from "@/components/branches/Tree"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { ProfileHero } from "@/components/blocks/profile/ProfileHero"
import { _ProfileTabs, type ProfileTabsData } from "@/components/blocks/profile/ProfileTabs"
import {
    defineCompositeComponent,
    defineContractComponent,
    defineContractProjection,
} from "@/components/contracts/props"

/** Screen-level situations settled by the persistent public-profile layout. */
export type PublicProfileLayoutProps = {
    readonly state: "loading" | "failed" | "not-found" | "locked" | "ready"
    readonly props: {
        readonly notFoundMessage: string
        readonly failedMessage: string
        readonly lockedMessage: string
        readonly lockedDescription: string
        readonly homeLabel: string
        readonly retryLabel: string
        readonly browseLabel: string
        readonly tabs: ProfileTabsData
    }
    readonly on: {
        readonly home: () => void
        readonly browse: () => void
        readonly retry: () => void
        readonly selectTab: (key: string) => void
    }
    readonly body: ComponentType
}

/** Draw persistent profile chrome and its screen-level alternatives. */
export const _PublicProfileLayout = (input: PublicProfileLayoutProps) => {
    const Body = input.body
    if (input.state === "failed") {
        return (
            <Tree
                contract="centred-empty-notice"
                render={defineContractComponent("centred-empty-notice", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ icon: "retry", message: input.props.failedMessage, actionLabel: input.props.retryLabel }}
                            on={{ act: input.on.retry }}
                        />
                    )),
                })}
            />
        )
    }

    if (input.state === "not-found") {
        return (
            <Tree
                contract="centred-empty-notice"
                render={defineContractComponent("centred-empty-notice", {
                    notice: defineCompositeComponent("empty-notice", {}, () => (
                        <EmptyNotice
                            props={{ icon: "account", message: input.props.notFoundMessage, actionLabel: input.props.homeLabel }}
                            on={{ act: input.on.home }}
                        />
                    )),
                })}
            />
        )
    }

    if (input.state === "locked") {
        return (
            <Tree contract="profile-page-measure" render={defineContractComponent("profile-page-measure", {
                inset: defineContractComponent("profile-page-inset", {
                    shell: defineContractComponent("profile-rail-container", {
                        split: defineContractComponent("profile-rail-then-main", {
                            rail: defineContractComponent("profile-identity-rail", {
                                hero: defineContractProjection("profile-hero-rail", () => <ProfileHero />),
                            }),
                            main: defineContractComponent("centred-empty-notice", {
                                notice: defineCompositeComponent("empty-notice", {}, () => (
                                    <EmptyNotice
                                        props={{
                                            icon: "password",
                                            message: input.props.lockedMessage,
                                            description: input.props.lockedDescription,
                                            actionLabel: input.props.browseLabel,
                                        }}
                                        on={{ act: input.on.browse }}
                                    />
                                )),
                            }),
                        }),
                    }),
                }),
            })} />
        )
    }

    return (
        <Tree contract="profile-tabs-over-body" render={defineContractComponent("profile-tabs-over-body", {
            tabs: defineContractProjection("underlined-tab-strip", () => (
                <_ProfileTabs props={input.props.tabs} on={{ select: input.on.selectTab }} />
            )),
            body: defineContractComponent("profile-page-measure", {
                inset: defineContractComponent("profile-page-inset", {
                    shell: defineContractComponent("profile-rail-container", {
                        split: defineContractComponent("profile-rail-then-main", {
                            rail: defineContractComponent("profile-identity-rail", {
                                hero: defineContractProjection("profile-hero-rail", () => <ProfileHero />),
                            }),
                            main: defineContractProjection("profile-main", () => <Body />),
                        }),
                    }),
                }),
            }),
        })} />
    )
}

/** Source-level marker for the pure profile layout. */
export const meta = { world: "pure", domain: "profile" } as const
