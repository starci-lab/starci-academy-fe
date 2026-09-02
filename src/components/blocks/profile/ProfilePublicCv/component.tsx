import type { IconName } from "@/components/leaves/Icon"
import { SurfaceCard } from "@starci/grammar/common"
import { Icon } from "@starci/grammar/common"
import { Badge } from "@starci/grammar/common"
import { Button } from "@starci/grammar/common"

import { Heading } from "@starci/grammar/common"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { Text } from "@starci/grammar/common"
import { ProfileCvBuilder } from "../ProfileCvBuilder"
import {
    publicCvActionsClassName,
    publicCvDocumentFrameClassName,
    publicCvDocumentStageClassName,
    publicCvHeaderClassName,
    publicCvIdentityClassName,
    publicCvNoticeClassName,
    publicCvNoticeCopyClassName,
    publicCvSkeletonClassName,
    publicCvSkeletonHeadingClassName,
    publicCvSkeletonLineClassName,
    publicCvSkeletonMetaClassName,
    publicCvSkeletonRuleClassName,
    publicCvSkeletonShortLineClassName,
    publicCvTitleRowClassName,
    publicCvWorkspaceClassName,
} from "./classNames"
import { Link } from "@starci/grammar/common"


/** Public CV state and content. */
export type ProfilePublicCvProps = {
    readonly state: "pending" | "empty" | "uncompiled" | "ready" | "error"
    readonly label: string
    readonly title: string
    readonly description: string
    readonly statusLabel: string
    readonly noticeTitle: string
    readonly noticeDescription: string
    readonly updatedLabel?: string
    readonly pdfUrl?: string
    readonly openLabel: string
    readonly editLabel: string
    readonly retryLabel: string
    readonly isSelf: boolean
    readonly retryPending?: boolean
    readonly on?: { readonly edit?: () => void; readonly retry?: () => void }
}

const STATUS_TONES = { pending: "neutral", empty: "neutral", uncompiled: "neutral", ready: "success", error: "danger" } as const
const STATUS_ICONS: Record<ProfilePublicCvProps["state"], IconName> = { pending: "pending", empty: "cv", uncompiled: "pending", ready: "complete", error: "incomplete" }

const PublicCvSkeleton = () => (
    <div className={publicCvDocumentStageClassName} aria-hidden="true">
        <div className={publicCvSkeletonClassName}>
            <div className={publicCvSkeletonHeadingClassName} />
            <div className={publicCvSkeletonMetaClassName} />
            <div className={publicCvSkeletonRuleClassName} />
            <div className={publicCvSkeletonLineClassName} />
            <div className={publicCvSkeletonShortLineClassName} />
            <div className={publicCvSkeletonLineClassName} />
            <div className={publicCvSkeletonShortLineClassName} />
        </div>
    </div>
)

const PublicCvNotice = (props: ProfilePublicCvProps) => {
    const action = props.state === "error"
        ? { label: props.retryLabel, icon: "retry" as const, pending: props.retryPending, press: props.on?.retry }
        : props.isSelf
            ? { label: props.editLabel, icon: "review" as const, pending: false, press: props.on?.edit }
            : undefined
    return (
        <div className={publicCvNoticeClassName} role={props.state === "error" ? "alert" : "status"}>
            <IconTile source={iconSourceFor(STATUS_ICONS[props.state], "leading")} tone={props.state === "error" ? "danger" : "neutral"} size={"md"} />
            <div className={publicCvNoticeCopyClassName}>
                <Heading level={4}>{props.noticeTitle}</Heading>
                <Text size={"sm"} tone={"muted"}>{props.noticeDescription}</Text>
            </div>
            {action === undefined ? null : <Button variant="secondary" size="sm" isPending={action.pending} onPress={action.press}>{action.label}</Button>}
        </div>
    )
}

/** Draw a stable public-CV workspace across document, loading, absence and recovery states. */
export const ProfilePublicCvBase = (props: ProfilePublicCvProps) => {
    if (props.isSelf) return <ProfileCvBuilder />
    const loading = props.state === "pending"
    return (
        <SurfaceCard label={props.label} frame={"frameless"} composition="joined">
            <section className={publicCvWorkspaceClassName} aria-label={props.label} data-state={props.state}>
                <header className={publicCvHeaderClassName}>
                    <div className={publicCvIdentityClassName}>
                        <div className={publicCvTitleRowClassName}>
                            <Text weight={"semibold"} isSkeleton={loading}>{props.title}</Text>
                            <Badge tone={STATUS_TONES[props.state]} startContent={<Icon source={iconSourceFor(STATUS_ICONS[props.state], "chip")} usage="chip" />} isSkeleton={loading}>{props.statusLabel}</Badge>
                        </div>
                        <Text size={"sm"} tone={"muted"} isSkeleton={loading}>{props.updatedLabel ?? props.description}</Text>
                    </div>
                    <div className={publicCvActionsClassName}>
                        {props.state === "ready" && props.pdfUrl !== undefined ? <Link href={props.pdfUrl} startContent={<Icon source={iconSourceFor("cv", "chip")} usage="chip" />}>{props.openLabel}</Link> : null}
                        {props.isSelf ? <Button variant={"secondary"} size={"sm"} isSkeleton={loading} onPress={({ press: props.on?.edit })?.press}>{props.editLabel}</Button> : null}
                    </div>
                </header>
                {loading ? <PublicCvSkeleton /> : props.state === "ready" && props.pdfUrl !== undefined ? (
                    <div className={publicCvDocumentStageClassName}>
                        <div className={publicCvDocumentFrameClassName}>
                            <ProfileCvDocument props={{ title: props.title, src: props.pdfUrl }} />
                        </div>
                    </div>
                ) : <PublicCvNotice {...props} />}
            </section>
        </SurfaceCard>
    )
}
