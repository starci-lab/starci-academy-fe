import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { Avatar } from "@/components/leaves/Avatar"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { Text } from "@starci/grammar/common"
import {
    challengeCardClassName,
    challengeCountdownClassName,
    challengeFinisherClassName,
    challengeFinisherListClassName,
    challengeFooterClassName,
    challengeHeadingClassName,
    challengeIdentityClassName,
    challengeSeparatorClassName,
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
            <SurfaceCard label={props.props.label} composition={"single"}>
                <EmptyNotice message={props.state === "failed" ? props.props.errorMessage : props.props.emptyMessage} actionLabel={props.state === "failed" ? props.props.retryLabel : props.props.actionLabel} iconSource={iconSourceFor("practice", "leading")} onAction={({ act: props.state === "failed" ? props.on?.retry : props.on?.act })?.act} />
            </SurfaceCard>
        )
    }

    const finishers = loading
        ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, label: "", passedAtLabel: "" }))
        : props.props.finishers ?? []
    const action = props.props.claimed === true
        ? <Badge tone={"success"}>{props.props.claimedLabel ?? ""}</Badge>
        : (
            <Button variant={"primary"} size={"sm"} isPending={props.props.isClaiming} isSkeleton={loading} onPress={({ press: props.on?.act })?.press}>{props.props.actionLabel ?? ""}</Button>
        )

    return (
        <SurfaceCard label={props.props.label} composition={"joined"} state={loading ? "pending" : "neutral"}>
            <div className={challengeCardClassName}>
                <div data-part="challenge-countdown" className={challengeCountdownClassName}>
                    <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.props.endsInLabel}</Text>
                </div>
                <div aria-hidden className={challengeSeparatorClassName} />
                <div data-part="challenge-heading" className={challengeHeadingClassName}>
                    <IconTile source={iconSourceFor("practice", "leading")} tone={"accent"} size={"md"} isSkeleton={loading} />
                    <div className={challengeIdentityClassName}>
                        <Text size={"sm"} weight={"normal"} isSkeleton={loading}>{props.props.title}</Text>
                        {props.props.passedCountLabel === undefined ? null : (
                            <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{props.props.passedCountLabel}</Text>
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
                                    <Text size={"sm"} weight={"normal"} isSkeleton={loading}>{finisher.label}</Text>
                                    <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{finisher.passedAtLabel}</Text>
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
    )
}
