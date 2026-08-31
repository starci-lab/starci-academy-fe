import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { IconTile } from "@/components/leaves/IconTile"
import { Text } from "@/components/leaves/Text"
import {
    challengeCardClassName,
    challengeCountdownClassName,
    challengeFinisherClassName,
    challengeFinisherListClassName,
    challengeFooterClassName,
    challengeHeadingClassName,
    challengeIdentityClassName,
    challengeSeparatorClassName,
    challengeSurfaceClassName,
} from "./classNames"

/** One weekly challenge finisher. */
export type WeeklyChallengeFinisher = { readonly id: string; readonly label: string; readonly passedAtLabel: string }
/** Weekly challenge content and state. */
export type WeeklyChallengeCardData = { readonly label: string; readonly emptyMessage: string; readonly errorMessage: string; readonly retryLabel: string; readonly title?: string; readonly endsInLabel?: string; readonly passedCountLabel?: string; readonly claimedLabel?: string; readonly viewerPassed?: boolean; readonly claimed?: boolean; readonly actionLabel?: string; readonly isClaiming?: boolean; readonly finishers?: ReadonlyArray<WeeklyChallengeFinisher> }
/** Weekly challenge actions. */
export type WeeklyChallengeCardActions = { readonly act?: () => void; readonly retry?: () => void }
/** Weekly challenge state and data. */
export type WeeklyChallengeCardProps = { readonly state: "pending" | "empty" | "failed" | "ready"; readonly props: WeeklyChallengeCardData; readonly on?: WeeklyChallengeCardActions }

/** Draw the weekly challenge card and optional finisher list. */
export const WeeklyChallengeCardBase = (props: WeeklyChallengeCardProps) => {
    const loading = props.state === "pending"
    if (props.state === "empty" || props.state === "failed") {
        return (
            <SurfaceCard props={{ label: props.props.label }}>
                <EmptyNotice
                    props={{
                        icon: "practice",
                        message: props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage,
                        actionLabel: props.state === "failed" ? props.props.retryLabel : props.props.actionLabel,
                    }}
                    on={{ act: props.state === "failed" ? props.on?.retry : props.on?.act }}
                />
            </SurfaceCard>
        )
    }

    const finishers = loading
        ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, label: "", passedAtLabel: "" }))
        : props.props.finishers ?? []
    const action = props.props.claimed === true
        ? <Badge props={{ content: props.props.claimedLabel ?? "", tone: "success" }} />
        : (
            <Button
                props={{
                    label: props.props.actionLabel ?? "",
                    size: "sm",
                    variant: "primary",
                    isPending: props.props.isClaiming,
                }}
                on={{ press: props.on?.act }}
                isLoading={loading}
            />
        )

    return (
        <div className={challengeSurfaceClassName}>
            <SurfaceCard props={{ label: props.props.label }} isLoading={loading}>
                <div className={challengeCardClassName}>
                    <div data-part="challenge-countdown" className={challengeCountdownClassName}>
                        <Text props={{ content: props.props.endsInLabel, size: "sm" }} isLoading={loading} />
                    </div>
                    <div aria-hidden className={challengeSeparatorClassName} />
                    <div data-part="challenge-heading" className={challengeHeadingClassName}>
                        <IconTile props={{ icon: "practice", tone: "accent", size: "md" }} isLoading={loading} />
                        <div className={challengeIdentityClassName}>
                            <Text props={{ content: props.props.title, size: "sm", weight: "normal" }} isLoading={loading} />
                            {props.props.passedCountLabel === undefined ? null : (
                                <Text
                                    props={{ content: props.props.passedCountLabel, size: "xs", tone: "muted" }}
                                    isLoading={loading}
                                />
                            )}
                        </div>
                    </div>
                    <div aria-hidden className={challengeSeparatorClassName} />
                    <div data-part="challenge-finishers">
                        <ul className={challengeFinisherListClassName}>
                            {finishers.map((finisher) => (
                                <li key={finisher.id}>
                                    <div data-part="challenge-finisher" className={challengeFinisherClassName}>
                                        <Avatar props={{ name: finisher.label, size: "sm" }} isLoading={loading} />
                                        <Text props={{ content: finisher.label, size: "sm", weight: "normal" }} isLoading={loading} />
                                        <Text props={{ content: finisher.passedAtLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div aria-hidden className={challengeSeparatorClassName} />
                    <div data-part="challenge-footer" className={challengeFooterClassName}>
                        {action}
                    </div>
                </div>
            </SurfaceCard>
        </div>
    )
}
