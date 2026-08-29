import { DashboardSurfaceCard as SurfaceCard } from "@/components/blocks/dashboard/DashboardSurfaceCard"
import { SurfaceListCard } from "@/components/branches/SurfaceListCard"
import { EmptyNotice } from "@/components/composites/EmptyNotice"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Icon } from "@/components/leaves/Icon"
import { Text } from "@/components/leaves/Text"
import { challengeActionClassName, challengeFinisherClassName, challengeHeadingClassName } from "./classNames"
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
    if (props.state === "empty" || props.state === "failed") return <SurfaceCard props={{ label: props.props.label }}><EmptyNotice props={{ icon: "practice", message: props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage, actionLabel: props.state === "failed" ? props.props.retryLabel : props.props.actionLabel }} on={{ act: props.state === "failed" ? props.on?.retry : props.on?.act }} /></SurfaceCard>
    const finishers = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, label: "", passedAtLabel: "" })) : props.props.finishers ?? []
    return (
        <SurfaceCard props={{ label: props.props.label }} isLoading={loading}>
            <div data-part="challenge-heading" className={challengeHeadingClassName}>
                <Icon props={{ name: "practice", role: "leading" }} />
                <Text props={{ content: props.props.title, size: "sm" }} isLoading={loading} />
            </div>
            <div data-part="challenge-action" className={challengeActionClassName}>
                <Text props={{ content: props.props.endsInLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                {props.props.claimed === true
                    ? <Badge props={{ content: props.props.claimedLabel ?? "", tone: "success" }} />
                    : <Button props={{ label: props.props.actionLabel ?? "", size: "sm", variant: "primary", isPending: props.props.isClaiming }} on={{ press: props.on?.act }} isLoading={loading} />}
            </div>
            {finishers.length === 0 ? (
                <Text props={{ content: props.props.passedCountLabel, size: "sm", tone: "muted" }} />
            ) : (
                <SurfaceListCard props={{ label: props.props.passedCountLabel ?? "", isNested: true }}>
                    {finishers.map((finisher) => (
                        <div key={finisher.id} data-part="challenge-finisher" className={challengeFinisherClassName}>
                            <Avatar props={{ name: finisher.label, size: "sm" }} isLoading={loading} />
                            <Text props={{ content: finisher.label, size: "sm" }} isLoading={loading} />
                            <Text props={{ content: finisher.passedAtLabel, size: "xs", tone: "muted" }} isLoading={loading} />
                        </div>
                    ))}
                </SurfaceListCard>
            )}
        </SurfaceCard>
    )
}
