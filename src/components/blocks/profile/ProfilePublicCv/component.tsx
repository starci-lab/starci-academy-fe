import type { IconName } from "@/components/leaves/Icon"
import { SurfaceCard } from "@/components/branches/SurfaceCard"
import { Badge } from "@/components/leaves/Badge"
import { Button } from "@/components/leaves/Button"
import { Heading } from "@/components/leaves/Heading"
import { IconTile } from "@/components/leaves/IconTile"
import { Link } from "@/components/leaves/Link"
import { ProfileCvDocument } from "@/components/leaves/ProfileCvDocument"
import { Text } from "@/components/leaves/Text"
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
            <IconTile props={{ icon: STATUS_ICONS[props.state], tone: props.state === "error" ? "danger" : "neutral", size: "md" }} />
            <div className={publicCvNoticeCopyClassName}>
                <Heading props={{ content: props.noticeTitle, level: 4 }} />
                <Text props={{ content: props.noticeDescription, tone: "muted", size: "sm" }} />
            </div>
            {action === undefined ? null : <Button props={{ label: action.label, variant: "secondary", size: "sm", icon: action.icon, isPending: action.pending }} on={{ press: action.press }} />}
        </div>
    )
}

/** Draw a stable public-CV workspace across document, loading, absence and recovery states. */
export const ProfilePublicCvBase = (props: ProfilePublicCvProps) => {
    const loading = props.state === "pending"
    return (
        <SurfaceCard props={{ label: props.label, isFrameless: true }}>
            <section className={publicCvWorkspaceClassName} aria-label={props.label} data-state={props.state}>
                <header className={publicCvHeaderClassName}>
                    <div className={publicCvIdentityClassName}>
                        <div className={publicCvTitleRowClassName}>
                            <Text props={{ content: props.title, weight: "semibold" }} isLoading={loading} />
                            <Badge props={{ content: props.statusLabel, tone: STATUS_TONES[props.state], icon: STATUS_ICONS[props.state] }} isLoading={loading} />
                        </div>
                        <Text props={{ content: props.updatedLabel ?? props.description, tone: "muted", size: "sm" }} isLoading={loading} />
                    </div>
                    <div className={publicCvActionsClassName}>
                        {props.state === "ready" && props.pdfUrl !== undefined ? <Link props={{ label: props.openLabel, externalHref: props.pdfUrl, icon: "cv" }} /> : null}
                        {props.isSelf ? <Button props={{ label: props.editLabel, variant: "secondary", size: "sm", icon: "review" }} on={{ press: props.on?.edit }} isLoading={loading} /> : null}
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
