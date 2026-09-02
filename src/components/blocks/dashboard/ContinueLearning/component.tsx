import { SurfaceCard } from "@starci/grammar/common"
import { EmptyNotice } from "@starci/grammar/common"
import { Text } from "@starci/grammar/common"
import { IconTile } from "@starci/grammar/common"
import { iconSourceFor } from "@/components/leaves/Icon"
import {
    continueLearningCompactContentClassName,
    continueLearningCopyClassName,
    continueLearningFeaturedContentClassName,
    continueLearningGridClassName,
    continueLearningIdentityClassName,
    continueLearningItemClassName,
} from "./classNames"
import { Icon, TextAction } from "@starci/grammar/common"

/** One resumable learning item. */
export type ResumeItem = { readonly id: string; readonly title: string; readonly kindLabel: string }
/** Shared section label. */
export type ContinueLearningFrame = { readonly label: string }
/** Notice state copy. */
export type ContinueLearningNotice = ContinueLearningFrame & { readonly message: string; readonly actionLabel: string }
/** Continue-learning state and actions. */
export type ContinueLearningProps = { readonly state: "pending" | "onboarding" | "empty" | "failed" | "ready"; readonly props: ContinueLearningFrame & Partial<ContinueLearningNotice> & { readonly items?: ReadonlyArray<ResumeItem>; readonly resumeLabel?: string }; readonly on?: { readonly resume?: (id: string) => void; readonly act?: () => void } }
/** Draw the resume section across pending, notice and ready states. */
export const ContinueLearningBase = (props: ContinueLearningProps) => {
    if (props.state === "onboarding" || props.state === "empty" || props.state === "failed") {
        return <SurfaceCard label={props.props.label} composition={"single"}><EmptyNotice message={props.props.message ?? ""} actionLabel={props.props.actionLabel} iconSource={iconSourceFor("course", "leading")} onAction={({ act: props.on?.act })?.act} /></SurfaceCard>
    }
    const loading = props.state === "pending"
    const items = loading ? Array.from({ length: 3 }, (_, index) => ({ id: `resting-${index}`, title: "", kindLabel: "" })) : props.props.items ?? []
    return (
        <SurfaceCard label={props.props.label} frame={"frameless"} composition={"joined"} state={loading ? "pending" : "neutral"}>
            <div className={continueLearningGridClassName}>
                {items.map((item, index) => (
                    <div className={continueLearningItemClassName} data-dashboard-resume-item={index === 0 ? "featured" : "supporting"} key={item.id}>
                        <SurfaceCard ariaLabel={item.title || props.props.label} height={"fill"} isHighlight={index === 0} composition={"single"} state={loading ? "pending" : "neutral"}>
                            <div className={index === 0 ? continueLearningFeaturedContentClassName : continueLearningCompactContentClassName}>
                                <IconTile source={iconSourceFor("course", "leading")} size={"md"} />
                                <div className={continueLearningCopyClassName} data-dashboard-resume-copy="true">
                                    <div className={continueLearningIdentityClassName} data-dashboard-resume-identity="true">
                                        <Text size={"xs"} tone={"muted"} isSkeleton={loading}>{item.kindLabel}</Text>
                                        <Text size={"md"} weight={"semibold"} isSkeleton={loading}>{item.title}</Text>
                                    </div>
                                    {loading || props.props.resumeLabel === undefined ? null : <TextAction appearance="disclosure" onPress={() => props.on?.resume?.(item.id)} endContent={<Icon source={iconSourceFor("next", "chip")} role="chip" />}>{props.props.resumeLabel}</TextAction>}
                                </div>
                            </div>
                        </SurfaceCard>
                    </div>
                ))}
            </div>
        </SurfaceCard>
    )
}
